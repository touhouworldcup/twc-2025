// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { fadeAudio, obs } from '../obs-controller'

let currentScene: string = ''
export async function setupAudio (): Promise<void> {
  const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene')
  currentScene = currentProgramSceneName
  obs.on('SceneTransitionStarted', () => {
    void onSceneTransitionStarted()
  })
  setInterval(switchAudioMonitorOutputs, 60000)
}

async function onSceneTransitionStarted (): Promise<void> {
  const { sceneName: toScene } = await obs.call('GetCurrentProgramScene')
  const fromScene = currentScene
  currentScene = toScene

  void handleCommsAudio(toScene)
  void handleAudioFades(fromScene, toScene)
}

function isCommentaryLive (scene: string): boolean {
  return !scene.includes('COMMS OFF')
}

function isGameScene (scene: string): boolean {
  return scene.includes('Player')
}

async function handleCommsAudio (toScene: string): Promise<void> {
  const inputAudioTracks: Record<number, boolean> = {}
  for (const track of [2, 3, 4, 5, 6]) {
    inputAudioTracks[track] = false
  }
  inputAudioTracks[1] = isCommentaryLive(toScene)

  for (const inputName of ['Comm1', 'Comm2', 'Comm3', 'Comm4', 'Discord']) {
    await obs.call('SetInputAudioTracks', { inputName, inputAudioTracks })
  }
}

async function handleAudioFades (fromScene: string, toScene: string): Promise<void> {
  if (!isCommentaryLive(fromScene) && isCommentaryLive(toScene)) {
    void fadeAudio({ inputName: 'Music', endDb: -7 })
  }
  if (isCommentaryLive(fromScene) && !isCommentaryLive(toScene)) {
    void fadeAudio({ inputName: 'Music', endDb: 0 })
  }
  if (!isGameScene(fromScene) && isGameScene(toScene)) {
    void fadeAudio({ inputName: 'Music', endDb: -100 })
    void fadeAudio({ inputName: 'WF', endDb: -15 })
  }
  if (isGameScene(fromScene) && !isGameScene(toScene)) {
    void fadeAudio({ inputName: 'Music', endDb: -7 })
    void fadeAudio({ inputName: 'WF', endDb: -100 })
  }
}

let lastFilterNum = 2
function switchAudioMonitorOutputs (): void {
  if (!obs.identified) return
  const nextFilterNum = lastFilterNum === 1 ? 2 : 1
  for (const sourceName of ['Music', 'WF']) {
    void obs.callBatch([
      {
        requestType: 'SetSourceFilterEnabled',
        requestData: {
          sourceName,
          filterName: `Audio Monitor ${lastFilterNum}`,
          filterEnabled: false
        }
      },
      {
        requestType: 'SetSourceFilterEnabled',
        requestData: {
          sourceName,
          filterName: `Audio Monitor ${nextFilterNum}`,
          filterEnabled: true
        }
      }
    ])
  }

  lastFilterNum = nextFilterNum
  nodecg.log.info('Switched Audio Monitor Filters')
}
