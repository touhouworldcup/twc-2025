// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { AbstractReplicant } from 'nodecg/out/shared/replicants.shared'
import textfit, { TextFitOption } from 'textfit'

export const params = new URLSearchParams(location.search)

type Replicant = AbstractReplicant<'client', unknown>
const replicants: Replicant[] = []
export function waitForReplicants (..._replicants: Replicant[]): void {
  replicants.push(..._replicants)
}

export function querySelector<Type extends HTMLElement> (selector: string): Type {
  const element = document.querySelector(selector)
  if (element === null) {
    throw new Error(`Did not find selector ${selector}`)
  }
  return element as Type
}

export function setText (selector: string, text: string | undefined, textFitOptions?: TextFitOption): void {
  const elem = querySelector(selector)
  if (text === undefined || text.trim() === '') {
    elem.style.display = 'none'
    return
  }
  elem.style.removeProperty('display')
  elem.innerText = text
  if (textFitOptions !== undefined) {
    textfit(elem, textFitOptions)
  }
}

export type LogLevel = 'debug' | 'error' | 'info' | 'log' | 'warn'
type LogHandler = (level: LogLevel, ...data: any[]) => void
export function patchLogger (handler: LogHandler): void {
  let logging = false
  for (const key of ['debug', 'error', 'info', 'log', 'warn'] as LogLevel[]) {
    const originalHandler = console[key]
    console[key] = (...data): void => {
      if (logging) return
      try {
        logging = true
        originalHandler.apply(console, data)
        handler(key, ...data)
      } finally {
        logging = false
      }
    }
  }
}

const file = location.pathname.replace(`/bundles/${nodecg.bundleName}/`, '')
const agent = navigator.userAgent
const randomId = crypto.randomUUID().split('-')[0]
console.log('Page opened', file, agent, randomId)

window.addEventListener('load', () => {
  void onWindowLoad()
})

const onLoadHandlers: Array<() => Promise<void>> = []
export function onLoad (handler: () => Promise<void>): void {
  onLoadHandlers.push(handler)
}

async function onWindowLoad (): Promise<void> {
  if (nodecg.socket.connected) {
    void onNodeCGLoad()
  } else {
    nodecg.socket.on('connect', () => {
      void onNodeCGLoad()
    })
  }
}

async function onNodeCGLoad (): Promise<void> {
  patchLogger((originalLevel, ...data) => {
    const level = originalLevel === 'log' ? 'info' : originalLevel // nodecg log does not have 'log' level
    const dataString = JSON.stringify([randomId, ...data])
    void nodecg.sendMessage('log', { level, dataString })
  })

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const length = replicants.length
    await NodeCG.waitForReplicants(...replicants)
    if (replicants.length === length) break
  }

  // run in reverse to trigger fadein last
  for (const handler of onLoadHandlers.reverse()) {
    await handler()
  }

  console.log('Page has finished loading:', file, agent)
}
