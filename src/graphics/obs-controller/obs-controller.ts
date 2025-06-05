// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js'
import { params, patchLogger, querySelector } from 'src/shared/browser-common'
import { initWorldFeedController } from './implementation-WF'
import { initEnglishController } from './implementation-EN'
import { LastSceneSwitchTime } from 'src/types/schemas/last-scene-switch-time'

const password = nodecg.bundleConfig['obs-websocket-password'] as string
const lastSceneSwitchTime = nodecg.Replicant<LastSceneSwitchTime>('last-scene-switch-time', 'twc-2025')

const nodecgKey = params.get('key') ?? ''
export const obs = new OBSWebSocket()
obs.on('CurrentPreviewSceneChanged', () => {
  lastSceneSwitchTime.value = Date.now()
})

patchLogger(logToHTML)
function logToHTML (level: string, ...data: any[]): void {
  const argsString = data.map((object) => {
    if (object instanceof Error) {
      return [object.name, object.message, object.cause, object.stack].join(' ')
    }
    const type = typeof object
    if (type === 'bigint') return (object as bigint).toString()
    if (type === 'symbol') return (object as symbol).toString()
    if (type === 'object') return JSON.stringify(object)
    if (type === 'function') return (object as Function).toString()
    return object
  }).join(' ').replaceAll(nodecgKey, 'NODECG_KEY_REDACTED')

  const element = document.createElement('span')
  element.innerHTML = `${new Date().toISOString()} [${level}] ${argsString}`
  const log = querySelector('#log')
  log.appendChild(element)
  if (log.childElementCount > 40) {
    log.firstChild?.remove()
  }
}

// patch obs emitter and log all OBS events
// would like to not use "any" here, but the type signature is balls long
const originalOBSEmit = obs.emit as any;
(obs as any).emit = (...data: any[]): void => {
  logToHTML('info', 'OBS Event', ...data)
  originalOBSEmit.apply(obs, data)
}

let port = 0
export async function connectOBS (_port?: number): Promise<void> {
  if (_port !== undefined) {
    port = _port
  }

  try {
    await obs.connect(`ws://127.0.0.1:${port}`, password)
  } catch (error) {
    console.error('Failed to connect to OBS', error)
  }
}

obs.on('ConnectionClosed', (error) => {
  void onConnectionClosed(error)
})

async function onConnectionClosed (error: OBSWebSocketError): Promise<void> {
  console.error('OBS connection closed', error)
  await new Promise(resolve => setTimeout(resolve, 1000))
  void connectOBS()
}

const currentlyFading = new Set()
interface FadeAudioArgs {
  inputName: string
  startDb?: number
  endDb?: number
  changeDb?: number
  duration?: number
}

export async function fadeAudio (args: FadeAudioArgs): Promise<void> {
  const inputName = args.inputName
  if (inputName === undefined) {
    throw new Error('no input')
  }

  let startDb = args.startDb
  if (startDb === undefined) {
    const { inputVolumeDb } = await obs.call('GetInputVolume', { inputName })
    startDb = inputVolumeDb
  }
  let endDb = args.endDb
  if (endDb === undefined) {
    if (args.changeDb === undefined) {
      throw new Error('need to specify either end or change db')
    }
    endDb = startDb + args.changeDb
  }

  let duration = args.duration
  if (duration === undefined) {
    duration = 1000
  }

  if (currentlyFading.has(inputName)) {
    console.error('Already fading', inputName)
    return
  }

  currentlyFading.add(inputName)
  setTimeout(() => {
    currentlyFading.delete(inputName)
  }, duration)

  const startGain = (startDb <= -100) ? 0 : Math.pow(10, startDb / 20)
  const endGain = (endDb <= -100) ? 0 : Math.pow(10, endDb / 20)
  const startTime = Date.now()

  while (true) {
    const currentTime = Date.now()
    const elapsedPercentage = (currentTime - startTime) / duration
    if (elapsedPercentage >= 1) {
      await obs.call('SetInputVolume', { inputName, inputVolumeDb: endDb })
      currentlyFading.delete(inputName)
      return
    }

    const currentGain = startGain + (endGain - startGain) * elapsedPercentage

    let inputVolumeDb
    if (currentGain <= 0.00001) {
      inputVolumeDb = -100
    } else {
      inputVolumeDb = 20 * Math.log10(currentGain)
    }

    await obs.call('SetInputVolume', { inputName, inputVolumeDb })
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

// implementation
const implementation = params.get('implementation')
if (implementation === 'WF') {
  void initWorldFeedController()
} else if (implementation === 'EN') {
  void initEnglishController()
}
