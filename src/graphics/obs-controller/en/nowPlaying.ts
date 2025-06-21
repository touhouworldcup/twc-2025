// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { obs } from '../obs-controller'

let lastText: string = ''
export function setupNowPlaying (): void {
  setInterval(() => {
    pollSong0().catch(console.error)
  }, 1000)
}

async function pollSong0 (): Promise<void> {
  if (!obs.identified) return
  const text = await getNowPlayingText()
  if (text === undefined) return
  if (lastText === text) return

  const inputName = 'Now Playing'
  const sourceName = inputName
  await obs.call('SetInputSettings', {
    inputName, inputSettings: { text }
  })
  await setNowPlayingScrolling(false)
  await new Promise(resolve => setTimeout(resolve, 20))
  lastText = text

  const sceneName = 'Pre-Match Slides'

  const { sceneItemId } = await obs.call('GetSceneItemId', {
    sceneName, sourceName
  })
  const { sceneItemTransform } = await obs.call('GetSceneItemTransform', {
    sceneName, sceneItemId
  })
  const sourceWidth = sceneItemTransform.sourceWidth as number
  const boundsWidth = sceneItemTransform.boundsWidth as number
  if (sourceWidth > boundsWidth) {
    await setNowPlayingScrolling(true)
  }
}

async function setNowPlayingScrolling (filterEnabled: boolean): Promise<void> {
  for (const filterName of ['Crop', 'Scroll']) {
    await obs.call('SetSourceFilterEnabled', {
      sourceName: 'Now Playing', filterName, filterEnabled
    })
  }
}

async function getNowPlayingText (): Promise<string | undefined> {
  try {
    return await getNowPlayingText0()
  } catch (error) {
    console.error(error)
    return 'Music player not running'
  }
}

const IGNORE_TITLES = new Set(['COMMENTARY START'])
async function getNowPlayingText0 (): Promise<string | undefined> {
  const response = await fetch('http://localhost:8880/api/player?columns=%artist%,%album%20artist%,%title%')
  const json = await response.json()
  const columns = json.player.activeItem.columns as string[]
  if (columns.length === 0) return ''

  const [artist, albumArtist, title] = columns
  if (IGNORE_TITLES.has(title)) {
    return undefined
  }

  if (albumArtist === 'OverClocked ReMix') {
    return `Now playing: ${title} by ${artist} (ocremix.org)`
  } else if (albumArtist === 'COOL&CREATE' || albumArtist === 'COOL＆CREATE' || albumArtist === 'COOL&CREATE') {
    return `Now playing: ${title} by COOL&CREATE (http://cool‑create.cc)`
  } else if (albumArtist === 'NoCopyrightSounds' || albumArtist === 'NCS Arcade') {
    return `Now playing: ${title} (http://spoti.fi/NCS)`
  } else if (albumArtist === artist) {
    return `Now playing: ${title} by ${artist}`
  } else {
    return `Now playing: ${title} by ${artist} (${albumArtist})`
  }
}
