// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { onLoad, querySelector, setText, waitForReplicants } from 'src/shared/browser-common'
import { setStretchText } from '../common'
import { getGameDataByRun } from 'src/shared/games'
import { TextControl } from 'src/types/schemas/text-control'
import { RunData } from 'nodecg-speedcontrol/src/types'

const textControlReplicant = nodecg.Replicant<TextControl>('text-control', 'twc-2025')
const runData = nodecg.Replicant<RunData>('runDataActiveRun', 'nodecg-speedcontrol')
const artworkAssets = nodecg.Replicant<Array<{
  base: string
  url: string
}>>('assets:artwork')
waitForReplicants(textControlReplicant, runData, artworkAssets)
onLoad(async () => {
  textControlReplicant.on('change', (tc) => {
    if (tc === undefined) return
    setTimeout(() => {
      setText('#results', tc.resultsFinal, {
        alignHoriz: true,
        alignVert: true,
        multiLine: true,
        maxFontSize: 40
      })
    }, 2000)
  })

  const run = runData.value
  if (run === undefined) return
  const { game, category } = getGameDataByRun(run)

  querySelector('#gameJP').innerText = game.japaneseName

  const gameEN = querySelector('#gameEN')
  setStretchText('#gameEN', game.englishName)
  gameEN.style.color = game.color

  setStretchText('#category', category)

  const credit = run.customData.artworkCredit
  if (credit !== undefined) {
    setTimeout(() => {
      setText('#credit', `Artwork by ${credit}`, {
        alignHoriz: true,
        alignVert: true,
        maxFontSize: 60
      })
    }, 2000)
  }

  const asset = artworkAssets.value?.find(asset => asset.base === run.customData.artworkFile)
  if (asset !== undefined) {
    querySelector<HTMLImageElement>('#artwork').src = asset.url
  }
})
