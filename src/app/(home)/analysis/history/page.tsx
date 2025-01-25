'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { db, ChessGame } from '@/lib/db'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getPlayerGames } from '@/lib/queries'

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

  const handleAddToStarred = async (game: ChessGame) => {
    console.log(game)
    console.log('Adding to starred.')

    await db.chessGames.add(game)
  }

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
          <ul className="space-y-4">
            {data &&
              data.games.map((game: any, index: number) => (
                <li key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between">
                    <p>
                      <strong>Players:</strong> {game.white.username} vs{' '}
                      {game.black.username}
                    </p>
                    <span
                      onClick={() => handleAddToStarred(game)}
                      className="cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-125"
                    >
                      ⭐
                    </span>
                  </div>
                  <p>
                    <strong>Result:</strong> {game.white.result} /{' '}
                    {game.black.result}
                  </p>
                  <p>
                    <Link
                      href={`/board/${index}`}
                      className="text-blue-500 hover:underline"
                    >
                      View Game
                    </Link>
                  </p>
                </li>
              ))}
            {error && <p>Could not fetch the games</p>}
          </ul>
        </div>
      </section>
    </main>
  )
}
