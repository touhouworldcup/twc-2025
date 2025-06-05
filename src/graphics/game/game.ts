// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { Timer } from 'nodecg-speedcontrol/src/types'
import { querySelector, params, setText, waitForReplicants } from 'src/shared/browser-common'
import { TextControl } from 'src/types/schemas/text-control'
import { ActiveAudio } from 'src/types/schemas/active-audio'
import { TextFitOption } from 'textfit'
import { getGameDataByRun } from 'src/shared/games'
import { msToString, setStretchText, runReplicant } from 'src/graphics/common'

const timerReplicant = nodecg.Replicant<Timer>('timer', 'nodecg-speedcontrol')
const textControlReplicant = nodecg.Replicant<TextControl>('text-control', 'twc-2025')
const activeAudio = nodecg.Replicant<ActiveAudio>('active-audio', 'twc-2025')
waitForReplicants(timerReplicant, runReplicant, textControlReplicant, activeAudio)

const selectedPlayers = (params.get('selectedPlayers') ?? '').split('').map(character => {
  return parseInt(character, 10)
})

const playerCount = selectedPlayers.length

activeAudio.on('change', (streamNumber) => {
  if (streamNumber === undefined) return
  const index = selectedPlayers.indexOf(streamNumber)
  const element = querySelector('#audio')
  element.classList.add('fadeOut')
  setTimeout(() => {
    element.classList = `fadeIn audio-${index}`
  }, 500)
})

Array.from(document.getElementsByClassName('layoutCss'))
  .map(elem => elem as HTMLLinkElement)
  .forEach((elem, index) => {
    elem.disabled = index !== playerCount - 1
  })

const textFitOptions: TextFitOption = {
  alignVert: true
}

runReplicant.on('change', (run) => {
  const { game, category } = getGameDataByRun(run)
  querySelector('#gameJP').innerText = game.japaneseName
  setStretchText('#gameEN', game.englishName)
  setStretchText('#category', category)

  let i = -1
  for (const index of selectedPlayers) {
    i++
    const name = run?.teams[index]?.players[0]?.name ?? ''
    setText(`#plate${i} > .plateMiddle`, name, textFitOptions)
  }
})

textControlReplicant.on('change', tc => {
  if (tc === undefined) return
  let i = -1
  for (const index of selectedPlayers) {
    i++
    setText(`#plate${i} > .plateTop`, tc.top[index], textFitOptions)
    setText(`#plate${i} > .plateBottom`, tc.bottom[index], textFitOptions)
  }

  setText('#resultsInner', adjustResultsText(tc.results), {
    alignHoriz: true,
    alignVert: true,
    multiLine: true,
    maxFontSize: 30
  })
})

function adjustResultsText (results: string): string {
  if (selectedPlayers.length !== 2) return results
  // remove single line breaks only
  // there is probably a way to do this with regexr
  return results.replaceAll('\n\n', '<--->')
    .replaceAll('\n', ' ')
    .replaceAll('<--->', '\n')
}

let lastTimer: Timer | undefined
let lastTimerUpdateTime = Date.now()

setInterval(updateTimer, 10)
function updateTimer (): void {
  if (lastTimer === undefined) return
  if (runReplicant.status !== 'declared') return

  const run = runReplicant.value
  if (run === undefined) return

  let ms = lastTimer.milliseconds
  if (lastTimer.state === 'running') {
    ms += Date.now() - lastTimerUpdateTime
  }

  const totalMs = (run.estimateS ?? 0) * 1000
  const remainingMs = totalMs - ms

  const remainingTime = querySelector('#remainingTime')
  const resetTimeText = querySelector('#resetTimeText')
  const finalRun = querySelector('#finalRun')
  if (remainingMs < 0) {
    resetTimeText.innerText = ''
    remainingTime.style.display = 'none'
    finalRun.style.display = 'block'
    return
  }

  const timerText = msToString(remainingMs)
  for (let i = 0; i < 6; i++) {
    const elem = querySelector(`#remainingTimeDigit${i}`)
    const character = timerText[i]
    if (character === undefined) {
      elem.style.display = 'none'
      continue
    }
    elem.style.removeProperty('display')
    elem.style.width = character === ':' ? '20px' : '55px'
    elem.innerText = character
  }
}

timerReplicant.on('change', (timer) => {
  lastTimer = timer
  lastTimerUpdateTime = Date.now()
})
