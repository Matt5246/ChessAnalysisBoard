import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { db } from '@/lib/db';
import Engine, { EngineMessage } from '@/lib/stockfish';

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
    engineAnalysis: EngineMessage[];
    moveFrom: string;
    moveTo: string | null;
    optionSquares: Record<string, any>;
    rightClickedSquares: Record<string, any>;
    setRightClickedSquares: (squares: Record<string, any>) => void;
    showPromotionDialog: boolean;
    onSquareClick: (square: Square) => void;
    onPromotionPieceSelect: (piece?: string) => void;
    onPieceDragBegin: (piece: string, sourceSquare: Square) => void;
    onPieceDragEnd: () => void;
    onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    getMoveOptions: (square: Square) => boolean;
    setSettings: (settings: { stockfishEnabled: boolean; depth: number }) => void;
    settings: { stockfishEnabled: boolean; depth: number };
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
    const [moveFrom, setMoveFrom] = useState<string>("")
    const [moveTo, setMoveTo] = useState<any | null>(null)
    const [optionSquares, setOptionSquares] = useState<Record<string, any>>({})
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({})
    const [showPromotionDialog, setShowPromotionDialog] = useState(false)
    const [engineAnalysis, setEngineAnalysis] = useState<EngineMessage[]>([]);
    const [settings, setSettings] = useState({ stockfishEnabled: false, depth: 15 });

    useEffect(() => {
        if (settings.stockfishEnabled) {
            const newEngine = new Engine();
            if (newEngine) {
                newEngine.onReady(() => {
                    console.log(`Evaluating new position: ${game.fen()}`);
                    newEngine.evaluatePosition(game.fen(), settings.depth);
                });
                newEngine.onMessage((message: EngineMessage) => {
                    if (message.multipv) {
                        setEngineAnalysis((prev) => {
                            const updatedAnalysis = [...prev];
                            updatedAnalysis[message.multipv - 1] = message;
                            return updatedAnalysis;
                        });
                    } else if (message.bestMove) {
                        console.log("Best move:", message.bestMove);
                        console.log("Ponder:", message.ponder);
                        console.log("Full analysis:", engineAnalysis);
                    }
                });
            }
        }
    }, [game.fen()]);

    const times = useMemo(() => {
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
            if (gameData) {
                setPgnState(gameData.pgn);
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

    const getMoveOptions = (square: Square) => {
        const moves = game.moves({ square, verbose: true })
        if (moves.length === 0) {
            setOptionSquares({})
            return false
        }

        const newSquares: Record<string, any> = {}

        moves.forEach((move: any) => {
            const targetSquare = game.get(move.to);
            const sourceSquare = game.get(square);
            newSquares[move.to] = {
                background: targetSquare && sourceSquare && targetSquare.color !== sourceSquare.color
                    ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                    : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            }
        })

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
            boxShadow: "0 0 10px rgba(255, 255, 0, 0.7)", // Highlight selected square
        }

        setOptionSquares(newSquares)
        return true
    }

    const onSquareClick = (square: Square) => {
        setRightClickedSquares({})

        if (!moveFrom) {
            // If no piece is selected, select the piece
            const hasMoveOptions = getMoveOptions(square)
            if (hasMoveOptions) setMoveFrom(square)
            return
        }

        if (!moveTo) {
            // Check if valid move
            const moves = game.moves({ verbose: true })
            const foundMove = moves.find((move) => move.from === moveFrom && move.to === square)
            if (!foundMove) {
                const hasMoveOptions = getMoveOptions(square)
                if (hasMoveOptions) setMoveFrom(square)
                return
            }

            setMoveTo(square)

            // If promotion move, show promotion dialog
            if ((foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8") ||
                (foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1")) {
                setShowPromotionDialog(true)
                return
            }

            // Normal move
            const gameCopy = new Chess(game.fen())
            const moveResult = gameCopy.move({ from: moveFrom, to: square, promotion: "q" })
            if (!moveResult) {
                const hasMoveOptions = getMoveOptions(square)
                if (hasMoveOptions) setMoveFrom(square)
                return
            }

            setGame(gameCopy)
            setFen(gameCopy.fen())
            setMoveFrom("")
            setMoveTo(null)
            setOptionSquares({})
            return
        }
    }

    const onPromotionPieceSelect = (piece?: string) => {
        if (piece && moveFrom && moveTo) {
            const gameCopy = new Chess(game.fen())
            gameCopy.move({
                from: moveFrom,
                to: moveTo!,
                promotion: piece ? piece.toLowerCase().charAt(1) : "q"
            })
            setGame(gameCopy)
            setFen(gameCopy.fen())
            return true;
        }
        setMoveFrom("")
        setMoveTo(null)
        setShowPromotionDialog(false)
        setOptionSquares({})
        return false;
    }
    const onPieceDragBegin = (piece: string, sourceSquare: Square) => {
        setMoveFrom(sourceSquare);
        getMoveOptions(sourceSquare);
    }
    const onPieceDragEnd = () => {
        setMoveFrom("");
        setMoveTo(null);
        setOptionSquares({});
    }
    const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
        const legalMoves = game.moves({ square: sourceSquare, verbose: true });
        const isLegalMove = legalMoves.some(move => move.to === targetSquare);

        if (!isLegalMove) {
            return false;
        }

        const gameCopy = new Chess(game.fen());
        const moveResult = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q"
        });

        if (moveResult) {
            setGame(gameCopy);
            setFen(gameCopy.fen())
            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
            return true;
        } else {
            return false;
        }
    }
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
                engineAnalysis,
                moveFrom,
                moveTo,
                optionSquares,
                rightClickedSquares,
                setRightClickedSquares,
                showPromotionDialog,
                onSquareClick,
                onPromotionPieceSelect,
                getMoveOptions,
                onPieceDragBegin,
                onPieceDragEnd,
                onPieceDrop,
                setSettings: (settings) => setSettings(settings),
                settings,
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
