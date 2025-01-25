'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

export default function Starred() {
  const chessGames = useLiveQuery(() => db.chessGames.toArray())
  console.log(chessGames)

  return <div>STARREd</div>
}
