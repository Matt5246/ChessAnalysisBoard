'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
export default function Home() {
    const [game, setGame] = useState(new Chess());
    const { id } = useParams();
    const games = useSelector((state: RootState) => state.games.games);
    const [pgn, setPgn] = useState(games[parseInt(id as string, 10) || 0]?.pgn || '');
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moves, setMoves] = useState<string[]>([]);
    const [fen, setFen] = useState(game.fen());
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const [boardWidth, setBoardWidth] = useState(400);

    useEffect(() => {
        const updateBoardWidth = () => {
            if (boardContainerRef.current) {
                const containerWidth = boardContainerRef.current.offsetWidth - 48;
                setBoardWidth(containerWidth);
            }
        };
        updateBoardWidth();
        window.addEventListener('resize', updateBoardWidth);
        return () => window.removeEventListener('resize', updateBoardWidth);
    }, []);

    const loadPgn = useCallback(() => {
        try {
            const newGame = new Chess();
            newGame.loadPgn(pgn);
            setGame(newGame);
            setMoves(newGame.history());
            setCurrentMoveIndex(0);
            setFen(newGame.fen());
        } catch (error) {
            console.error('Invalid PGN:', error);
        }
    }, [pgn]);
    function extractMoves(pgn: string) {
        const moves = pgn
            .replace(/\[.*?\]/g, '') // Remove all the metadata (e.g., Event, Date)
            .replace(/(\d+\.\s*)/g, '') // Remove move numbers
            .replace(/\{.*?\}/g, '') // Remove annotations and comments
            .replace(/\.\./g, '') // Remove the dots between moves
            .replace(/\s+/g, ' ') // Normalize spaces between moves to single space
            .replace(/\s*1-0\s*$/, '') // Remove the result at the end (e.g., 1-0)
            .trim(); // Remove leading/trailing spaces
        return moves;
    }
    const getFenFromMove = useCallback((moveIndex: number) => {
        const newGame = new Chess();
        const movesOnlyPgn = extractMoves(pgn);
        console.log(movesOnlyPgn);
        const trimmedPgn = movesOnlyPgn.split(' ').slice(0, moveIndex + 1).join(' '); // Trim PGN up to the desired move index
        newGame.loadPgn(trimmedPgn);
        return newGame.fen();
    }, [pgn]);

    const goToMove = useCallback((index: number) => {
        setCurrentMoveIndex(index);
        setFen(getFenFromMove(index)); // Update FEN when moving to a specific move
    }, [getFenFromMove]);

    const nextMove = useCallback(() => {
        if (currentMoveIndex < moves.length - 1) {
            goToMove(currentMoveIndex + 1);
        }
    }, [currentMoveIndex, moves.length, goToMove]);

    const previousMove = useCallback(() => {
        if (currentMoveIndex > 0) {
            goToMove(currentMoveIndex - 1);
        }
    }, [currentMoveIndex, goToMove]);

    const resetBoard = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setMoves([]);
        setCurrentMoveIndex(-1);
        setPgn('');
    }, []);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Chess Analysis Board</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card className="p-6" ref={boardContainerRef}>
                            <div className="aspect-square w-full">
                                <Chessboard
                                    position={fen}
                                    boardWidth={boardWidth}
                                    areArrowsAllowed={true}
                                    customBoardStyle={{
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                                    }}
                                />
                            </div>
                        </Card>

                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={previousMove}
                                disabled={currentMoveIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <Button variant="outline" onClick={resetBoard}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={nextMove}
                                disabled={currentMoveIndex === moves.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">PGN Input</h2>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Paste your PGN here..."
                                    value={pgn}
                                    onChange={(e) => setPgn(e.target.value)}
                                    className="h-[200px] font-mono"
                                />
                                <Button
                                    onClick={loadPgn}
                                    className="w-full"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Load PGN
                                </Button>
                            </div>
                            <div className="flex items-center justify-between mt-5">
                                <p className="text-gray-600">Example: 1. e4 e5 2. d4 d5 3. Nf3 Nc6</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setPgn('1. e4 e5 2. d4 d5 3. Nf3 Nc6') }}
                                    className="ml-4"
                                >
                                    Use
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">Move List</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {moves.map((move, index) => (
                                    <Button
                                        key={index}
                                        variant={currentMoveIndex === index ? "default" : "outline"}
                                        onClick={() => goToMove(index)}
                                        className="text-sm"
                                    >
                                        {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
