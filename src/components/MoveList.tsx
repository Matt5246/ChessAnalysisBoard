'use client'

import { FC } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MoveListProps {
    moves: string[]
    times: string[] // Add times array
    currentMoveIndex: number
    goToMove: (index: number) => void
    nextMove: () => void
    previousMove: () => void
    resetBoard: () => void
}

const MoveList: FC<MoveListProps> = ({
    moves,
    times, // Destructure times
    currentMoveIndex,
    goToMove,
    nextMove,
    previousMove,
    resetBoard,
}) => {
    const movesPairs = moves.reduce((pairs, move, index) => {
        const pairIndex = Math.floor(index / 2)
        if (!pairs[pairIndex]) {
            pairs[pairIndex] = { white: move, black: null, whiteTime: times[index], blackTime: null }
        } else {
            pairs[pairIndex].black = move
            pairs[pairIndex].blackTime = times[index]
        }
        return pairs
    }, [] as { white: string; black: string | null; whiteTime: string; blackTime: string | null }[])

    return (
        <Card className="flex flex-col max-h-[81svh] max-w-[40vh] bg-background">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Moves</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-0.5">
                    {movesPairs.map((pair, pairIndex) => (
                        <div
                            key={pairIndex}
                            className={cn(
                                "flex items-center text-sm",
                                pairIndex % 2 === 0 ? "bg-muted/50" : "bg-background"
                            )}
                        >
                            <div className="w-12 px-2 py-1.5 text-muted-foreground font-mono">
                                {pairIndex + 1}.
                            </div>
                            <button
                                onClick={() => goToMove(pairIndex * 2)}
                                className={cn(
                                    "flex-1 px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                                    currentMoveIndex === pairIndex * 2 && "bg-primary text-primary-foreground font-medium"
                                )}
                            >
                                {pair.white} <span className="text-xs text-muted-foreground">({pair.whiteTime})</span>
                            </button>
                            {pair.black && (
                                <button
                                    onClick={() => goToMove(pairIndex * 2 + 1)}
                                    className={cn(
                                        "flex-1 px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                                        currentMoveIndex === pairIndex * 2 + 1 && "bg-primary text-primary-foreground font-medium"
                                    )}
                                >
                                    {pair.black} <span className="text-xs text-muted-foreground">({pair.blackTime})</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t bg-muted/50">
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={previousMove}
                        disabled={currentMoveIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetBoard}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={nextMove}
                        disabled={currentMoveIndex === moves.length - 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default MoveList