'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import GameHistoryList from '../history/GameHistoryList'

export default function LastViewed() {
  const chessGames = useLiveQuery(() => db.chessGames.toArray())
  console.log(chessGames)

  return (
    <div>
      <h1>Last Viewed Chess Games</h1>
      {chessGames?.length ? (
        <GameHistoryList games={chessGames} />
      ) : (
        <p>No games viewed recently.</p>
      )}
    </div>
  )
}

