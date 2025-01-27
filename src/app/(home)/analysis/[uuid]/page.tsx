'use client';

import { useEffect } from 'react';
import Chessboard from '@/components/Chessboard';
import { useParams } from 'next/navigation';
import MoveList from '@/components/MoveList';
import { useGameContext } from '@/context/GameContext';
import { Chess } from 'chess.js';

const Home: React.FC = () => {
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
        setPgn,
    } = useGameContext();

    useEffect(() => {
        const loadGame = async () => {
            if (!uuid) return;

            const gameData = await fetchGameByUuid(uuid as string);
            if (gameData) {
                setPgn(gameData.pgn);

                const newGame = new Chess();
                newGame.loadPgn(gameData.pgn);
                goToMove(0);
            }
        };

        loadGame();
    }, [uuid]);

    return (
        <div className="bg-background p-4 md:p-8">
            <div className="max-w-9xl mx-auto space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Chess Analysis Board</h1>
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
