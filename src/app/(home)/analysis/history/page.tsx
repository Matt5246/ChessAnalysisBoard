'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getPlayerGames } from '@/lib/queries'
import GameHistoryList from './GameHistoryList'

export default function History() {
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('hikaru')
  const [month, setMonth] = useState(12)
  const [year, setYear] = useState(2024)

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['player-games', username, month, year],
    queryFn: () => getPlayerGames({ username, month, year }),
    enabled: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null



  return (
    <main className="flex-1 flex flex-col items-center">
      <section className="w-full py-12">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Player Games</h1>
          <div className="mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="border p-2 mr-2"
            />
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Year"
              className="border p-2 mr-2"
            />
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              placeholder="Month"
              className="border p-2 mr-2"
            />
            <Button onClick={() => refetch()}>
              {isLoading ? <Spinner /> : 'Fetch Games'}
            </Button>
          </div>

          {data && data.games.length > 0 ? (
            <GameHistoryList games={data.games} />
          ) : (
            <div className="text-center text-gray-400">
              No games found.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
