// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

import { Api } from 'nocodb-sdk'
import { nodecg } from '../util/nodecg'
import { RunData, RunDataPlayer, RunDataTeam } from 'speedcontrol-util/types/speedcontrol'
import { games } from '../../shared/games'
import { DatabaseConfiguration, Player, Match } from './db-types'

const config = nodecg.bundleConfig.nocodb as DatabaseConfiguration
const api = new Api({
  baseURL: 'https://app.nocodb.com',
  headers: {
    'xc-token': config.token
  }
})

export function setupUpdateRunsListener (): void {
  nodecg.listenFor('update-runs', 'twc-2025', (_, ack) => {
    if (ack === undefined || ack.handled) return
    updateRunsFromDatabase().then(() => ack(null, true)).catch(() => ack(null, false))
  })
}

async function updateRunsFromDatabase (): Promise<void> {
  nodecg.log.info('Updating runs from database')
  const schedule = await getTable<Match>(...config.scheduleView)
  const players = await getTable<Player>(...config.playersView)

  const runDatas = schedule.flatMap((match) => createRunData(match, players))
  let prevID: string | undefined = ''
  for (const runData of runDatas) {
    nodecg.sendMessageToBundle('modifyRun', 'nodecg-speedcontrol', { runData, prevID })
    nodecg.log.info('Updated', runData.game)
    prevID = runData.id
  }
}

function createRunData (match: Match, players: Player[]): RunData[] {
  if (match.Category === '???') return []

  const [numberName, ...categoryArray] = match.Category.split(' ')
  const category = categoryArray.join(' ')
  const shortName = games.find(g => g.numberName === numberName)?.shortName
  if (shortName === undefined) {
    nodecg.log.error('Did not find game', numberName)
  }

  return [{
    id: id(match.Category),
    game: `${shortName ?? numberName} ${category}`,
    gameTwitch: 'Touhou Project',
    estimate: getEstimate(match.ResetTime),
    teams: [match.Player_1, match.Player_2, match.Player_3].flatMap((player, index) => {
      return createTeam(player, index, players)
    }),
    customData: getMatchCustomData(match)
  }]
}

function getEstimate (minutes: number): string {
  const hh = `${Math.floor(minutes / 60)}`.padStart(2, '0')
  const mm = `${minutes % 60}`.padStart(2, '0')
  return `${hh}:${mm}:00`
}

const dateUTCKey = 'Date__UTC_'
function getMatchCustomData (match: Match): {
  [key: string]: string
} {
  const existingCustomData = nodecg.readReplicant<RunData[]>('runDataArray', 'nodecg-speedcontrol')
    ?.find(other => other.id === id(match.Category))?.customData ?? {}
  const time = match[dateUTCKey]
  if (time === null) return {}
  const hourOffset = config.hourOffset
  const offset = hourOffset * 3600000
  const dbTime = Date.parse(time)
  return Object.assign({}, existingCustomData, {
    startTime: new Date(dbTime + offset).toISOString()
  })
}

function createTeam (player: string, index: number, players: Player[]): RunDataTeam[] {
  if (player === '-' || player === '???') return []
  const dbPlayer = players.find(p => p.Name === player)
  if (dbPlayer === undefined) {
    console.error('Did not find player', player)
    return []
  }

  return [{
    id: 'team_' + id(dbPlayer.Name),
    name: ['Team Aya', 'Team Hatate', 'Team Momiji'][index],
    players: [createPlayer(dbPlayer)]
  }]
}

function createPlayer (player: Player): RunDataPlayer {
  const nameJP = player.JapaneseName ?? player.ChineseName
  return {
    name: player.Name,
    id: id(player.Name),
    teamID: 'team_' + id(player.Name),
    social: {
      twitch: player.DisplayStream === 1 ? player.Stream ?? undefined : undefined
    },
    customData: nameJP === null ? {} : { nameJP }
  }
}

function id (input: string): string {
  return input.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
}

export async function getTable<T> (orgs: string, baseName: string, tableName: string, viewName: string): Promise<T[]> {
  const result: object[] = []
  const params: {
    offset?: number
  } = {}
  while (true) {
    try {
      const { list, pageInfo } = await api.dbViewRow.list(orgs, baseName, tableName, viewName, params)
      result.push(...list)
      if (pageInfo.isLastPage === true) return result as T[]
      params.offset = (params.offset ?? 0) + list.length
    } catch (error) {
      console.log(error)
      return result as T[]
    }
  }
}
