import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { db } from '@/lib/db';

interface GameContextType {
    game: Chess;
    pgn: string;
    currentMoveIndex: number;
    fen: string;
    moves: string[];
    times: string[];
    fetchGameByUuid: (uuid: string) => Promise<void>;
    goToMove: (index: number) => void;
    nextMove: () => void;
    previousMove: () => void;
    resetBoard: () => void;
    setPgn: (pgn: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
    children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const [game, setGame] = useState(new Chess());
    const [pgn, setPgnState] = useState('');
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [fen, setFen] = useState(game.fen());
    const [moves, setMoves] = useState<string[]>([]);

    const times = useMemo(() => {
        const timeRegex = /\[%clk\s*([0-9]+:[0-9]+:[0-9]+(?:\.[0-9]+)?)\]/g;
        const times: string[] = [];
        let match;
        while ((match = timeRegex.exec(pgn)) !== null) {
            times.push(match[1]);
        }
        return times;
    }, [pgn]);

    const setPgn = (newPgn: string) => {
        setPgnState(newPgn);
        if (newPgn !== pgn) {  // Update the game only if the PGN changes
            const newGame = new Chess();
            newGame.loadPgn(newPgn);
            setGame(newGame);
            setFen(newGame.fen());
            setMoves(newGame.history());
        }
    };

    const fetchGameByUuid = useCallback(async (uuid: string) => {
        try {
            const gameData = await db.chessGames.get(uuid);
            if (gameData) {
                setPgn(gameData.pgn);
                if (game.pgn() !== gameData.pgn) {
                    const newGame = new Chess();
                    newGame.loadPgn(gameData.pgn);
                    setGame(newGame);
                    setFen(newGame.fen());
                    setMoves(newGame.history());
                }
                setCurrentMoveIndex(0); // Set to the start
            }
        } catch (error) {
            console.error('Error fetching game data:', error);
        }
    }, [game]);

    const goToMove = useCallback((index: number) => {
        const movesOnly = pgn
            .replace(/\[.*?\]/g, '')
            .replace(/(\d+\.\s*)/g, '')
            .replace(/\{.*?\}/g, '')
            .replace(/\.\./g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*1-0\s*$/, '')
            .trim();
        const trimmedPgn = movesOnly.split(' ').slice(0, index + 1).join(' ');

        // Load the game with the new PGN up to the desired move
        game.loadPgn(trimmedPgn);
        setFen(game.fen());
        setCurrentMoveIndex(index);
    }, [pgn, game]);

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
        setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        game.reset();
    }, [game]);

    return (
        <GameContext.Provider
            value={{
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
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};
