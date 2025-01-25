"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Rocket } from "lucide-react";
// import { useTheme } from "next-themes";

async function fetchChessComGames(username: string, year: number, month: number) {
    const url = `https://api.chess.com/pub/player/${username}/games/${year}/${month}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data;
}

export default function Home() {
    const [mounted, setMounted] = useState(false);
    // const { theme, setTheme } = useTheme();
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState("hikaru");
    interface Game {
        white: {
            username: string;
            result: string;
        };
        black: {
            username: string;
            result: string;
        };
    }

    const [games, setGames] = useState<Game[]>([]);
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(12);
    useEffect(() => {
        setMounted(true);
    }, []);
    const fetchPlayerData = async () => {
        try {
            const data = await fetchChessComGames(username, year, month);
            console.log(data);
            setGames(data.games);
            setError(null);
        } catch (err) {
            setError("Failed to fetch player data. Please try again later.");
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col min-h-screen">
            <header className="w-full max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
                <Link className="flex items-center justify-center" href="#">
                    <Rocket className="h-6 w-6 mr-2" />
                    <span className="font-bold">next-startup</span>
                </Link>

            </header>
            <main className="flex-1 flex flex-col items-center">
                <section className="w-full py-12">
                    <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Player Games</h1>
                        <div className="mb-6">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="border p-2 mr-2"
                            />
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                placeholder="Year"
                                className="border p-2 mr-2"
                            />
                            <input
                                type="number"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                placeholder="Month"
                                className="border p-2 mr-2"
                            />
                            <Button onClick={fetchPlayerData}>Fetch Games</Button>
                        </div>
                        {error ? (
                            <p className="text-red-500">{error}</p>
                        ) : games.length > 0 ? (
                            <ul className="space-y-4">
                                {games.map((game, index) => (
                                    <li key={index} className="p-4 border rounded-md">
                                        <p>
                                            <strong>Players:</strong> {game.white.username} vs{" "}
                                            {game?.black?.username}
                                        </p>
                                        <p>
                                            <strong>Result:</strong> {game.white.result} /{" "}
                                            {game.black.result}
                                        </p>
                                        <p>
                                            <Link
                                                href={`/board/${index}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                View Game
                                            </Link>
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Loading games...</p>
                        )}
                    </div>
                </section>
            </main>
            <footer className="w-full max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row py-6 shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    © 2024 next-startup. All rights and lefts reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}