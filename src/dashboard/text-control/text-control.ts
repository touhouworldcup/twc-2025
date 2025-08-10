// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { querySelector } from 'src/shared/browser-common'
import { RunData } from 'nodecg-speedcontrol/src/types'
import { TextControl } from 'src/types/schemas/text-control'

const MAX_PLAYERS = 5
const runReplicant = nodecg.Replicant<RunData>('runDataActiveRun', 'nodecg-speedcontrol')
const textControlReplicant = NodeCG.Replicant<TextControl>('text-control', 'twc-2025')

runReplicant.on('change', (run) => {
  for (let i = 0; i < MAX_PLAYERS; i++) {
    querySelector(`#p${i}_middle`).innerText = run?.teams[i]?.players?.[0].name ?? ''
  }
})

textControlReplicant.on('change', (tc) => {
  if (tc === undefined) return

  for (let i = 0; i < MAX_PLAYERS; i++) {
    querySelector<HTMLInputElement>(`#p${i}_top`).value = tc.top[i]
    querySelector<HTMLInputElement>(`#p${i}_bottom`).value = tc.bottom[i]
  }

  querySelector<HTMLTextAreaElement>('#results').value = tc.results
  querySelector<HTMLTextAreaElement>('#resultsFinal').value = tc.resultsFinal
  querySelector<HTMLTextAreaElement>('#player-N').value = `${tc.selectedPlayer ?? '1'}`
})

for (const elem of document.getElementsByClassName('update')) {
  (elem as HTMLButtonElement).onclick = update
}

function update (): void {
  let selectedPlayer = parseInt(querySelector<HTMLTextAreaElement>('#player-N').value, 10)
  if (isNaN(selectedPlayer)) selectedPlayer = 1
  textControlReplicant.value = {
    top: [0, 1, 2, 3, 4].map(num => querySelector<HTMLInputElement>(`#p${num}_top`).value),
    bottom: [0, 1, 2, 3, 4].map(num => querySelector<HTMLInputElement>(`#p${num}_bottom`).value),
    results: querySelector<HTMLInputElement>('#results').value,
    resultsFinal: querySelector<HTMLInputElement>('#resultsFinal').value,
    selectedPlayer
  }
}
