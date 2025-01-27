//@ts-nocheck
'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

interface ChessboardComponentProps {
    fen: string
}

const ChessboardComponent: FC<ChessboardComponentProps> = ({ fen }) => {
    const [game, setGame] = useState(new Chess(fen))
    const [moveFrom, setMoveFrom] = useState<string>("")
    const [moveTo, setMoveTo] = useState<any | null>(null)
    const [optionSquares, setOptionSquares] = useState<Record<string, any>>({})
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({})
    const [showPromotionDialog, setShowPromotionDialog] = useState(false)

    useEffect(() => {
        setGame(new Chess(fen))
    }, [fen])
    // useEffect(() => {
    //     const stockfish = new Worker("/stockfish.js");
    //     const DEPTH = 8; // Search depth
    //     const FEN_POSITION =
    //         "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    //     const wasmPath = '/stockfish.wasm';

    //     stockfish.postMessage({
    //         type: 'init',
    //         wasmPath,
    //     });
    //     stockfish.postMessage("uci");
    //     stockfish.postMessage(`position fen ${FEN_POSITION}`);
    //     stockfish.postMessage(`go depth ${DEPTH}`);

    //     stockfish.onmessage = (e) => {
    //         console.log(e.data); // in the console output you will see `bestmove e2e4` message
    //     };
    // }, []);
    // const safeGameMutate = (modify: (game: Chess) => void) => {
    //     setGame((g) => {
    //         const updatedGame = new Chess(g.fen()) // Ensure it's a Chess instance
    //         modify(updatedGame)
    //         return updatedGame
    //     })
    // }

    const getMoveOptions = (square: string) => {
        const moves = game.moves({ square, verbose: true })
        if (moves.length === 0) {
            setOptionSquares({})
            return false
        }

        const newSquares: Record<string, any> = {}

        moves.forEach((move) => {
            newSquares[move.to] = {
                background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
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

    const onSquareClick = (square: string) => {
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
            const gameCopy = new Chess(game.fen()) // Properly clone the game
            const moveResult = gameCopy.move({ from: moveFrom, to: square, promotion: "q" })
            if (!moveResult) {
                const hasMoveOptions = getMoveOptions(square)
                if (hasMoveOptions) setMoveFrom(square)
                return
            }

            setGame(gameCopy)
            setMoveFrom("")
            setMoveTo(null)
            setOptionSquares({})
            return
        }
    }

    const onPromotionPieceSelect = (piece?: string) => {
        if (piece && moveFrom && moveTo) {
            const gameCopy = new Chess(game.fen()) // Properly clone the game
            gameCopy.move({
                from: moveFrom,
                to: moveTo!,
                promotion: piece?.toLowerCase() ?? "q"
            })
            setGame(gameCopy)
        }
        setMoveFrom("")
        setMoveTo(null)
        setShowPromotionDialog(false)
        setOptionSquares({})
    }



    return (
        <div>
            <Chessboard
                id="ClickToMove"
                animationDuration={200}
                arePiecesDraggable={false}
                position={game.fen()}
                onSquareClick={onSquareClick}
                onPromotionPieceSelect={onPromotionPieceSelect}
                customBoardStyle={{
                    borderRadius: "4px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                }}
                customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares
                }}
                promotionToSquare={moveTo}
                showPromotionDialog={showPromotionDialog}
                arePremovesAllowed={true}
                clearPremovesOnRightClick={true}
                onPieceDragBegin={(piece, sourceSquare) => {
                    setMoveFrom(sourceSquare);
                    getMoveOptions(sourceSquare);
                }}
                onPieceDragEnd={() => {
                    setMoveFrom("");
                    setMoveTo(null);
                    setOptionSquares({});
                }}
                onPieceDrop={(sourceSquare, targetSquare) => {
                    const gameCopy = new Chess(game.fen());
                    const moveResult = gameCopy.move({
                        from: sourceSquare,
                        to: targetSquare,
                        promotion: "q"
                    });

                    if (moveResult) {
                        setGame(gameCopy);
                        setMoveFrom("");
                        setMoveTo(null);
                        setOptionSquares({});
                        return true;
                    } else {
                        return false;
                    }
                }}
                arePiecesDraggable={true}
                customDarkSquareStyle={{
                    backgroundColor: "#779952"
                }}
                customLightSquareStyle={{
                    backgroundColor: "#edeed1"
                }}
            />
        </div>
    )
}

export default ChessboardComponent
