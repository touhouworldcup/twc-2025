// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { RunData } from 'nodecg-speedcontrol/src/types'
import { querySelector, params, setText, onLoad, waitForReplicants } from 'src/shared/browser-common'
import { getGameDataByRun } from 'src/shared/games'
import { msToString } from '../common'

const timezone = parseInt(params.get('timezone') ?? '9', 10)

function renderColorBackground (color: string): void {
  const scrollBuilder = querySelector<HTMLCanvasElement>('#scrollBuilder')
  const scrollTile = querySelector<HTMLImageElement>('#scrollTile')
  const scroll = querySelector<HTMLImageElement>('#scroll')

  const ctx = scrollBuilder.getContext('2d')
  if (ctx === null) return

  for (let i = 0; i < 40; i++) {
    ctx.drawImage(scrollTile, 0, i * 54)
  }

  ctx.globalCompositeOperation = 'multiply' // multiply it by red color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 506, 2160)
  ctx.globalCompositeOperation = 'destination-atop' // restore transparency
  ctx.drawImage(scrollBuilder, 0, 0)
  scrollBuilder.toBlob((blob) => {
    const url = URL.createObjectURL(blob as Blob)
    scroll.src = url
    scrollBuilder.remove()
    scrollTile.remove()
  })
}

let matchTime = Date.now()
const runData = nodecg.Replicant<RunData>('runDataActiveRun', 'nodecg-speedcontrol')
waitForReplicants(runData)
onLoad(async () => {
  const run = runData.value
  if (run === undefined) return

  matchTime = Date.parse(run.customData.startTime)
  const { game, category } = getGameDataByRun(run)

  setText('#gameJP', game.japaneseName)
  setText('#gameEN', game.englishName)
  renderColorBackground(game.color)
  setText('#category', category)

  for (let i = 0; i < 5; i++) {
    const team = run.teams[i]
    const plate = querySelector(`#player${i}`)
    if (team === undefined) {
      plate.style.display = 'none'
      continue
    }
    plate.style.removeProperty('display')
    const player = team.players[0]
    setText(`#player${i} > .team`, team.name)
    querySelector(`#player${i} > .team`).setAttribute('team', team.name ?? '')
    setText(`#player${i} > .name > .nameEN`, player.name)
    setText(`#player${i} > .name > .nameJP`, player.customData?.nameJP)
  }

  setTimeout(scalePlayerContainer, 100)
  updateTimer()
})

function scalePlayerContainer (): void {
  const elem = querySelector('#playersContainer')
  const { width, height } = elem.getBoundingClientRect()
  const scale = Math.min(1270 / width, 550 / height)
  elem.style.transform = `scale(${scale})`
}

function updateTimer (): void {
  if (matchTime === undefined) return
  let remaining = (matchTime - Date.now())
  if (remaining < 0) {
    remaining = 0
  }

  if (remaining > 6000000) {
    const date = new Date(matchTime + 3600000 * timezone)

    const month = {
      3: 'Apr',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'Aug'
    }[date.getUTCMonth().toString()] ?? ''

    const day = pad(date.getUTCDate())
    const hour = pad(date.getUTCHours())
    const minute = pad(date.getUTCMinutes())
    setText('#timeTop', `${month} ${day}`)
    setTime(`${hour}:${minute}`)
    setText('#timeBottom', `GMT${timezone >= 0 ? '+' : ''}${timezone}`)
    setTimeout(updateTimer, 10000)
  } else {
    setText('#timeTop', '')
    setTime(msToString(remaining))
    setText('#timeBottom', '')
    const delay = remaining + 50 - Math.floor(remaining / 1000) * 1000
    setTimeout(updateTimer, delay)
  }
}

function setTime (text: string): void {
  text.split('').forEach((digit, index) => {
    setText(`#timer${index}`, digit)
  })
}

function pad (num: number): string {
  return `${num}`.padStart(2, '0')
}
