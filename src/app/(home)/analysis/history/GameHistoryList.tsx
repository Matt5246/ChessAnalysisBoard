'use client'

import { Button } from '@/components/ui/button'
import { Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Game {
  id: string
  white: {
    username: string
    rating: number
    uuid: string
    result: string
  }
  black: {
    username: string
    rating: number
    uuid: string
    result: string
  }
  accuracies: {
    white: number
    black: number
  }
  type: string
  end_time: number
  fen: string
  initial_setup: string
  pgn: string
  rated: boolean
  rules: string
  tcn: string
  time_class: string
  time_control: string
  url: string
  uuid: string
}

const GameHistoryList = ({ games }: { games: Game[] }) => {
  // Sort games by end time
  const sortedGames = [...games].sort((a, b) => b.end_time - a.end_time)

  return (
    <div className="w-full min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Game History</h2>
        <div className="grid grid-cols-[1fr_100px_120px_80px_120px] gap-4 mb-2 px-4 text-muted-foreground">
          <div>Players</div>
          <div>Result</div>
          <div>Accuracy</div>
          <div>Moves</div>
          <div>Date</div>
        </div>
        <div className="space-y-px rounded-lg">
          {sortedGames.map((game: Game) => (
            <div
              key={game.uuid}
              className="grid grid-cols-[1fr_100px_120px_80px_120px] gap-4 px-4 py-3 items-center relative rounded-lg bg-muted group hover:bg-accent transition-colors duration-200"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-background rounded" />
                  <span className="font-medium">
                    {game.white.username}
                  </span>
                  <span className="text-muted-foreground">
                    ({game.white.rating})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-foreground rounded" />
                  <span className="font-medium">
                    {game.black.username}
                  </span>
                  <span className="text-muted-foreground">
                    ({game.black.rating})
                  </span>
                </div>
              </div>
              <div className="flex flex-col font-medium ml-5">
                <span
                  className={cn(
                    game.white.result === 'win'
                      ? 'text-green-500'
                      : 'text-red-500',
                    'dark:text-green-400 dark:text-red-400'
                  )}
                >
                  {game.white.result === 'win' ? '1' : '0'}
                </span>
                <span
                  className={cn(
                    game.black.result === 'win'
                      ? 'text-green-500'
                      : 'text-red-500',
                    'dark:text-green-400 dark:text-red-400'
                  )}
                >
                  {game.black.result === 'win' ? '1' : '0'}
                </span>
              </div>
              <div className="ml-5">
                {game.accuracies ? (
                  <div className="flex flex-col">
                    <span className="text-primary">
                      {game.accuracies.white.toFixed(1)}
                    </span>
                    <span className="text-primary">
                      {game.accuracies.black.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
                  >
                    Review
                  </Button>
                )}
              </div>
              <div className="ml-3">
                {parseInt(
                  game.pgn
                    .trim()
                    .split(/\s+/)
                    .reverse()
                    .find((move) => /^\d+\.$/.test(move))
                    ?.replace('.', '') || '0',
                  10
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">
                  {new Date(game.end_time * 1000).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </span>
                {game.type === 'bullet' ? (
                  <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                )}
              </div>
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                bg-gradient-to-b from-accent/70 to-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameHistoryList
