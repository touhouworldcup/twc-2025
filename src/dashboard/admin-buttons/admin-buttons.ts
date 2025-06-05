// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { querySelector } from '../../shared/browser-common'

const button = querySelector < HTMLButtonElement >('#reload')
button.addEventListener('click', () => {
  void nodecg.sendMessage('reloadPages', 'twc-2025')
})
