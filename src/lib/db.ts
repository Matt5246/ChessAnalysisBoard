import Dexie, { type EntityTable } from 'dexie'

interface ChessGame {
  id: number //For some reason it needs it
  uuid: string
  url: string
  pgn: string
  tcn: string
  fen: string
  time_class: string
  rules: string
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
  chessGames: EntityTable<ChessGame, 'id'>
}

db.version(1).stores({
  chessGames:
    '++id, uuid, url, pgn, tcn, fen, time_class, rules, accuracies, white, black', // primary key "id" (for the runtime!)
})

export type { ChessGame }
export { db }
