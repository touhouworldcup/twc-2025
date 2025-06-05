// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { setupAudio } from './en/audio'
import { setupNowPlaying } from './en/nowPlaying'
import { checkVoiceDisplazCrop as checkVoiceDisplayCrop } from './en/vc-crop'
import { connectOBS } from './obs-controller'

export async function initEnglishController (): Promise<void> {
  await connectOBS(4455)
  await new Promise(resolve => setTimeout(resolve, 1000))
  void setupAudio()
  setupNowPlaying()
  void checkVoiceDisplayCrop()
  setInterval(() => {
    checkVoiceDisplayCrop().catch(console.error)
  }, 1000)
}
