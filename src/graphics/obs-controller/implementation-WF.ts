// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { ActiveAudio } from 'src/types/schemas/active-audio'
import { connectOBS, fadeAudio, obs } from './obs-controller'

const activeAudio = nodecg.Replicant<ActiveAudio>('active-audio', 'twc-2025')

let currentScene = ''
export async function initWorldFeedController (): Promise<void> {
  await connectOBS(4456)
  await new Promise(resolve => setTimeout(resolve, 1000))
  const { sceneName } = await obs.call('GetCurrentProgramScene')
  currentScene = sceneName
  await updateAudioTracks()
  setInterval(() => {
    void updateAudioTracks()
  }, 5000)
  obs.on('SceneTransitionStarted', (event) => {
    void onSceneTransitionStarted(event)
  })
  obs.on('InputMuteStateChanged', (event) => {
    void onInputMuteStateChanged(event)
  })
}

async function onSceneTransitionStarted (event: { transitionName: string }): Promise<void> {
  const { transitionName } = event
  let executionTime = Date.now()
  const { sceneName } = await obs.call('GetCurrentProgramScene')
  currentScene = sceneName
  if (transitionName === 'Stinger') {
    executionTime += 1000
  }
  void updateAudioTracks(executionTime)
  void handleFoobar(executionTime)
}

async function onInputMuteStateChanged (event: { inputName: string, inputMuted: boolean }): Promise<void> {
  const { inputName, inputMuted } = event

  if (inputMuted) return
  const streamNumber = parseInt(inputName.slice(-1), 10) - 1
  if (isNaN(streamNumber)) return
  activeAudio.value = streamNumber
  if (isPlayerScene()) {
    void fadeAudio({ inputName, startDb: -100, endDb: 0, duration: 1000 })
  } else {
    void obs.call('SetInputVolume', { inputName, inputVolumeDb: 0 })
  }
  const otherInputNames = [1, 2, 3, 4, 5].flatMap(num => {
    return [`VLC-${num}`, `Web-${num}`]
  })

  for (const otherInputName of otherInputNames) {
    if (inputName === otherInputName) continue
    void mute(otherInputName)
  }
}

async function mute (inputName: string): Promise<void> {
  if (isPlayerScene()) {
    await fadeAudio({ inputName, endDb: -100 })
    await obs.call('SetInputMute', { inputName, inputMuted: true })
    await obs.call('SetInputVolume', { inputName, inputVolumeDb: -10 })
  } else {
    await obs.call('SetInputMute', { inputName, inputMuted: true })
    await obs.call('SetInputVolume', { inputName, inputVolumeDb: 0 })
  }
}

async function waitForExecutionTime (executionTime?: number): Promise<void> {
  const now = Date.now()
  if (executionTime !== undefined && executionTime > now) {
    const delay = executionTime - now
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

async function updateAudioTracks (executionTime?: number): Promise<void> {
  await waitForExecutionTime(executionTime)

  for (const num of [1, 2, 3, 4, 5]) {
    for (const inputName of [`VLC-${num}`, `Web-${num}`]) {
      void setTrackEnabled(inputName, isPlayerScene())
    }
  }
  void setTrackEnabled('Music', !isPlayerScene())
}

function isPlayerScene (): boolean {
  return currentScene.includes('Player')
}

async function setTrackEnabled (inputName: string, enabled: boolean): Promise<void> {
  const inputAudioTracks: Record<number, boolean> = {}
  for (const track of [2, 3, 4, 5, 6]) {
    inputAudioTracks[track] = false
  }
  inputAudioTracks[1] = enabled
  await obs.call('SetInputAudioTracks', { inputName, inputAudioTracks })
}

async function executeCommand (command: string): Promise<void> {
  void fetch(`http://localhost:8880/api/player/${command}`, { method: 'POST' })
}

async function handleFoobar (executionTime: number): Promise<void> {
  const { player } = await fetch('http://localhost:8880/api/player').then(async r => await r.json())
  const isPlaying = player.activeItem.position > 0
  const shouldBePlaying = !isPlayerScene()
  await waitForExecutionTime(executionTime)
  if (isPlaying && !shouldBePlaying) {
    void executeCommand('stop')
  }
  if (!isPlaying && shouldBePlaying) {
    await waitForExecutionTime(3000)
    void executeCommand('play')
  }
}
