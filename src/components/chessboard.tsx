'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useGameContext } from '@/context/GameContext'



const ChessboardComponent: FC = () => {
    const {
        fen,
        onPromotionPieceSelect,
        onSquareClick,
        optionSquares,
        rightClickedSquares,
        setRightClickedSquares,
        moveTo,
        showPromotionDialog,
        moveFrom,
        onPieceDragBegin,
        onPieceDragEnd,
        onPieceDrop,
    } = useGameContext();

    return (
        <div>
            <Chessboard
                id="ClickToMove"
                animationDuration={200}
                arePiecesDraggable={false}
                position={fen}
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
                onPieceDragBegin={onPieceDragBegin}
                onPieceDragEnd={onPieceDragEnd}
                onPieceDrop={onPieceDrop}
                onSquareRightClick={(square) => {
                    setRightClickedSquares({
                        [square]: {
                            background: "rgba(255, 0, 0, 0.6)",
                            boxShadow: "0 0 10px rgba(255, 0, 0, 0.9)",
                        }
                    });
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
