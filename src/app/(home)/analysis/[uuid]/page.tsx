'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '@/components/Chessboard';
import { db } from '@/lib/db';
import { useParams } from 'next/navigation';
import MoveList from '@/components/MoveList';

const Home: React.FC = () => {
    const [game, setGame] = useState(() => new Chess());
    const [pgn, setPgn] = useState('');
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [fen, setFen] = useState(game.fen());
    const { uuid } = useParams();

    const moves = useMemo(() => {
        return game.history();
    }, [game]);

    const times = useMemo(() => {
        if (!pgn) return [];
        const timeRegex = /\[%clk\s*([0-9]+:[0-9]+:[0-9]+(?:\.[0-9]+)?)\]/g;
        const times: string[] = [];
        let match;
        while ((match = timeRegex.exec(pgn)) !== null) {
            times.push(match[1]);
        }
        return times;
    }, [pgn]);

    const fetchGameByUuid = useCallback(async (uuid: string) => {
        try {
            const gameData = await db.chessGames.get(uuid);
            return gameData;
        } catch (error) {
            console.error('Error fetching game data:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        const loadGame = async () => {
            if (!uuid) return;

            const gameData = await fetchGameByUuid(uuid as string);
            if (gameData) {
                const newGame = new Chess();
                newGame.loadPgn(gameData.pgn);
                setGame(newGame);
                setPgn(gameData.pgn);
                setCurrentMoveIndex(0);
                setFen(newGame.fen());
            }
        };

        loadGame();
    }, [uuid, fetchGameByUuid]);

    const getFenFromMove = useCallback(
        (moveIndex: number) => {
            const newGame = new Chess();
            const movesOnly = pgn
                .replace(/\[.*?\]/g, '')
                .replace(/(\d+\.\s*)/g, '')
                .replace(/\{.*?\}/g, '')
                .replace(/\.\./g, '')
                .replace(/\s+/g, ' ')
                .replace(/\s*1-0\s*$/, '')
                .trim();
            const trimmedPgn = movesOnly.split(' ').slice(0, moveIndex + 1).join(' ');
            newGame.loadPgn(trimmedPgn);
            return newGame.fen();
        },
        [pgn]
    );

    const goToMove = useCallback(
        (index: number) => {
            setCurrentMoveIndex(index);
            setFen(getFenFromMove(index));
        },
        [getFenFromMove]
    );

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
        setCurrentMoveIndex(-1);
        setFen(getFenFromMove(-1));
    }, [getFenFromMove]);

    return (
        <div className="bg-background p-4 md:p-8">
            <div className="max-w-9xl mx-auto space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
                    Chess Analysis Board
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Chessboard fen={fen} />
                    </div>
                    <div className="space-y-6">
                        <MoveList
                            moves={moves}
                            times={times}
                            currentMoveIndex={currentMoveIndex}
                            goToMove={goToMove}
                            nextMove={nextMove}
                            previousMove={previousMove}
                            resetBoard={resetBoard}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
