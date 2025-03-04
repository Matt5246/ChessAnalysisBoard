'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Cpu } from 'lucide-react';
import useKey from '@/hooks/use-key';
import { useParams } from 'next/navigation';
import { useGameContext } from '@/context/GameContext';
import { Chess } from 'chess.js'; // Import chess.js

const MoveList: FC = () => {
    const params = useParams();
    const uuid = params?.uuid;
    const {
        engineAnalysis,
        currentMoveIndex,
        settings,
        moves,
        times,
        fen,
        setSettings,
        fetchGameByUuid,
        goToMove,
        nextMove,
        previousMove,
        resetBoard,
    } = useGameContext();

    const [linesVisible, setLinesVisible] = useState(true);
    const [engineEnabled, setEngineEnabled] = useState(false);
    const [depth, setDepth] = useState('15');

    useEffect(() => {
        const loadGame = async () => {
            if (!uuid) return;
            await fetchGameByUuid(uuid as string);
        };

        loadGame();
    }, [uuid]);

    const convertUciToSan = (uciMoves: string[]): string[] => {
        const tempGame = new Chess(fen)
        const sanMoves: string[] = [];

        for (const uciMove of uciMoves) {
            // Skip empty or invalid UCI moves
            if (!uciMove || uciMove.length < 4 || uciMove.length > 5) {
                console.error(`Invalid UCI move: ${uciMove}`);
                break;
            }

            try {
                const move = tempGame.move({
                    from: uciMove.slice(0, 2), // First two characters (e.g., "b7")
                    to: uciMove.slice(2, 4),   // Next two characters (e.g., "b6")
                    promotion: uciMove.length > 4 ? uciMove[4] : undefined, // Handle promotions
                });
                if (move) {
                    sanMoves.push(move.san);
                }
            } catch (error) {
                console.error(`Invalid move: ${uciMove}`, error);
                break;
            }
        }

        return sanMoves;
    };

    const parseUciMessage = (uciMessage: string) => {
        const parts = uciMessage.split(' ');
        const depth = parts[2];
        const multipv = parts[6];
        const scoreIndex = parts.indexOf('score');
        const positionEvaluation = scoreIndex !== -1 && parts[scoreIndex + 1] === 'cp' ? parts[scoreIndex + 2] : undefined;
        const possibleMate = scoreIndex !== -1 && parts[scoreIndex + 1] === 'mate' ? parts[scoreIndex + 2] : undefined;
        const pvIndex = parts.indexOf('pv');
        const pv = pvIndex !== -1 ? parts.slice(pvIndex + 1).join(' ') : '';

        const pvMoves = pv.split(' ');
        let sanPv = pv;
        const sanMoves = convertUciToSan(pvMoves);
        if (sanMoves.length > 0) {
            sanPv = sanMoves.join(' ');
        }

        console.log("pv:", pv, "sanPv:", sanPv)
        return {
            depth: Number(depth),
            multipv: Number(multipv),
            positionEvaluation: positionEvaluation ? Number(positionEvaluation) : undefined,
            possibleMate: possibleMate ? Number(possibleMate) : undefined,
            pv: sanPv, // Use SAN for PV
            uciMessage,
        };
    };

    const analysis = engineAnalysis.map((item: any) => parseUciMessage(item.uciMessage));

    const movesPairs = moves.reduce((pairs, move, index) => {
        const pairIndex = Math.floor(index / 2);
        if (!pairs[pairIndex]) {
            pairs[pairIndex] = { white: move, black: null, whiteTime: times[index], blackTime: null };
        } else {
            pairs[pairIndex].black = move;
            pairs[pairIndex].blackTime = times[index];
        }
        return pairs;
    }, [] as { white: string; black: string | null; whiteTime: string; blackTime: string | null }[]);

    useKey('ArrowLeft', previousMove);
    useKey('ArrowRight', nextMove);

    const handleDepthChange = (newDepth: string) => {
        setDepth(newDepth);
        setSettings({
            ...settings,
            depth: Number(newDepth),
        });
    };

    const handleEngineToggle = () => {
        setEngineEnabled(!engineEnabled);
        setSettings({
            ...settings,
            stockfishEnabled: !engineEnabled,
        });
    };

    return (
        <Card className="flex flex-col min-w-[40vh] bg-background select-none h-full">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Stockfish</h2>
                    </div>
                    <Switch
                        checked={engineEnabled}
                        onCheckedChange={handleEngineToggle}
                        aria-label="Toggle engine analysis"
                    />
                </div>

                {engineEnabled && linesVisible && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="depth">Depth</Label>
                            <Select
                                value={depth}
                                onValueChange={handleDepthChange}
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

                        {analysis && (
                            analysis.map((analysisItem, index) => (
                                <div key={index} className="space-y-2 bg-muted p-3 rounded-lg relative">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Depth:</span>
                                        <span className="font-medium">{analysisItem.depth}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Evaluation:</span>
                                        <span className={cn(
                                            "font-medium",
                                            Number(analysisItem?.positionEvaluation) > 0 ? "text-green-500" : "text-red-500"
                                        )}>
                                            {Number(analysisItem?.positionEvaluation) > 0 ? "+" : ""}{(Number(analysisItem.positionEvaluation) / 100).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="text-sm truncate">
                                        <span className="text-muted-foreground">Line: </span>
                                        <span className="font-medium">{analysisItem.pv.length > 50 ? `${analysisItem.pv.slice(0, 50)}...` : analysisItem.pv}</span>
                                    </div>
                                    {analysisItem.possibleMate && (
                                        <div className="absolute bottom-3 right-3 flex justify-between text-sm font-bold text-purple-500">
                                            <span className="">Mate in:</span>
                                            <span className="font-medium">{analysisItem.possibleMate}</span>
                                        </div>
                                    )}
                                </div>
                            ))
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
    );
};

export default MoveList;