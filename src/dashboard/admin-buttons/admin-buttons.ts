// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { querySelector } from '../../shared/browser-common'

const reloadButton = querySelector<HTMLButtonElement>('#reload')
reloadButton.addEventListener('click', () => {
  reloadButton.disabled = true
  void nodecg.sendMessage('reloadPages', 'twc-2025')
  setTimeout(() => {
    reloadButton.disabled = false
  }, 5000)
})

const updateDatabaseButton = querySelector<HTMLButtonElement>('#update-db')
updateDatabaseButton.addEventListener('click', () => {
  updateDatabaseButton.disabled = true
  updateDatabaseButton.innerText = 'Updating...'
  void nodecg.sendMessage('update-runs', 'twc-2025').then((result) => {
    updateDatabaseButton.innerText = `Updated database: ${result as string}`
  })
})
