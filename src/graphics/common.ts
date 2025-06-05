// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { onLoad, querySelector, setText, waitForReplicants } from '../shared/browser-common'
import { LastSceneSwitchTime } from 'src/types/schemas/last-scene-switch-time'
import { RunData } from 'nodecg-speedcontrol/src/types'
import { getGameDataByRun } from 'src/shared/games'

const lastSceneSwitchTime = nodecg.Replicant<LastSceneSwitchTime>('last-scene-switch-time', 'twc-2025')
export const runReplicant = nodecg.Replicant<RunData>('runDataActiveRun', 'nodecg-speedcontrol')
waitForReplicants(lastSceneSwitchTime, runReplicant)

onLoad(async () => {
  const { game } = getGameDataByRun(runReplicant.value)
  querySelector(':root').style.setProperty('--gameColor', game.color)

  document.body.classList = 'fadeIn'
  const loadTime = Date.now()
  // wait for 1 second for OBS controller to send replicant value over
  await new Promise(resolve => setTimeout(resolve, 1000))
  const switchTime = lastSceneSwitchTime.value
  if (switchTime === undefined || switchTime === 0) {
    console.log('Page loaded in unknown time')
  } else {
    lastSceneSwitchTime.value = 0
    const loadDuration = loadTime - switchTime
    console.log(`Page loaded in ${(loadDuration / 1000).toFixed(2)}s`)
  }
})

nodecg.listenFor('reloadPages', 'twc-2025', () => {
  document.body.classList = 'fadeOut'
  setTimeout(() => {
    location.reload()
  }, 500)
})

export function invertColor (hex: string): string {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16)
  const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16)
  const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
  // pad each with zeros and return
  return '#' + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0')
}

export function msToString (ms: number): string {
  const min = Math.floor(Math.floor(ms / 1000) / 60)
  const sec = Math.floor(ms / 1000) % 60
  const mm = `${min}`.padStart(2, '0')
  const ss = `${sec}`.padStart(2, '0')

  return `${mm}:${ss}`
}

export function setStretchText (selector: string, text: string): void {
  setText(selector, text)

  setTimeout(() => {
    const elem = querySelector(selector)
    const parent = elem.parentElement
    if (parent === null) return
    const stretchWidth = (parent.offsetWidth - 10) / elem.offsetWidth
    if (stretchWidth < 1) {
      elem.style.transform = `scaleX(${stretchWidth})`
    } else {
      elem.style.transform = 'scaleX(1)'
    }

    elem.style.removeProperty('display')
    elem.style.removeProperty('visibility')
  }, 100)
}
