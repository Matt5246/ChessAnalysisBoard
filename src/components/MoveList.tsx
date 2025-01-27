'use client'

import { FC, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Cpu } from 'lucide-react'
import useKey from '@/hooks/use-key'
import { useParams } from 'next/navigation'
import { useGameContext } from '@/context/GameContext'

interface MoveListProps {
    bestMove?: {
        move: string
        score: number
        line: string[]
    }
}

const MoveList: FC<MoveListProps> = ({
    bestMove,
}) => {
    const { uuid } = useParams();
    const {
        game,
        pgn,
        currentMoveIndex,
        fen,
        moves,
        times,
        fetchGameByUuid,
        goToMove,
        nextMove,
        previousMove,
        resetBoard,
    } = useGameContext();

    useEffect(() => {
        const loadGame = async () => {
            if (!uuid) return;
            await fetchGameByUuid(uuid as string);
        };

        loadGame();
    }, [uuid]);

    const [engineEnabled, setEngineEnabled] = useState(false)
    const [depth, setDepth] = useState("15")
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

    useKey('ArrowLeft', previousMove)
    useKey('ArrowRight', nextMove)
    return (
        <Card className="flex flex-col max-h-[81svh] max-w-[40vh] bg-background select-none">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Stockfish</h2>
                    </div>
                    <Switch
                        checked={engineEnabled}
                        onCheckedChange={setEngineEnabled}
                        aria-label="Toggle engine analysis"
                    />
                </div>

                {engineEnabled && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="depth">Depth</Label>
                            <Select
                                value={depth}
                                onValueChange={setDepth}
                            >
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Depth" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 15, 20, 25, 30].map((d) => (
                                        <SelectItem key={d} value={d.toString()}>
                                            {d}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {bestMove && (
                            <div className="space-y-2 bg-muted p-3 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Best move:</span>
                                    <span className="font-medium">{bestMove.move}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Evaluation:</span>
                                    <span className={cn(
                                        "font-medium",
                                        bestMove.score > 0 ? "text-green-500" : "text-red-500"
                                    )}>
                                        {bestMove.score > 0 ? "+" : ""}{bestMove.score.toFixed(1)}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Line: </span>
                                    <span className="font-medium">{bestMove.line.join(" ")}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
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