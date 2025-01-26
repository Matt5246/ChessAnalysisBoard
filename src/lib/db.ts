import Dexie, { type EntityTable } from 'dexie'

interface ChessGame {
  uuid: string
  url: string
  pgn: string
  tcn: string
  fen: string
  time_class: string
  end_time: number
  rules: string
  type: string
  initial_setup: string
  rated: boolean
  time_control: string
  accuracies: {
    black: number
    white: number
  }
  white: {
    rating: number
    result: string
    id: string
    username: string
    uuid: string
  }
  black: {
    rating: number
    result: string
    id: string
    username: string
    uuid: string
  }
}

const db = new Dexie('ChessAnalyserDb') as Dexie & {
  chessGames: EntityTable<ChessGame, 'uuid'>
}

db.version(1).stores({
  chessGames:
    'uuid, url, pgn, tcn, fen, time_class, rules, accuracies, white, black, end_time',
})

export type { ChessGame }
export { db }
