'use client';
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessAnalysis() {
    const [game, setGame] = useState<Chess | null>(null);
    const [pgn, setPgn] = useState(""); // PGN input
    const [error, setError] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false); // Tracks hydration status

    useEffect(() => {
        setIsHydrated(true);
        setGame(new Chess());
    }, []);

    const handlePgnInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPgn(event.target.value);
    };

    const loadPgn = () => {
        if (!game) return;
        const newGame = new Chess();
        if (newGame.loadPgn(pgn)) {
            setGame(newGame);
            setError(null);
        } else {
            setError("Invalid PGN format. Please check the input.");
        }
    };

    const handleMove = (sourceSquare: string, targetSquare: string) => {
        if (!game) return;
        const newGame = new Chess(game.fen());
        const move = newGame.move({ from: sourceSquare, to: targetSquare });

        if (move) {
            setGame(newGame);
        }
    };

    if (!isHydrated || !game) return null; // Avoid rendering until hydrated

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-4">Chess Analysis</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div>
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={(sourceSquare, targetSquare) =>
                            handleMove(sourceSquare, targetSquare)
                        }
                        customBoardStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <textarea
                        value={pgn}
                        onChange={handlePgnInput}
                        placeholder="Paste PGN data here..."
                        className="w-full h-40 p-2 border rounded-md"
                    ></textarea>
                    <button
                        onClick={loadPgn}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Load PGN
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                    <h2 className="text-lg font-semibold mt-4">Game Info:</h2>
                    <pre className="bg-gray-100 p-2 rounded-md text-sm">
                        {game.pgn() || "No moves yet."}
                    </pre>
                </div>
            </div>
        </div>
    );
}
