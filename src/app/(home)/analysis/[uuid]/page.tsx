'use client';

import { useEffect } from 'react';
import Chessboard from '@/components/chessboard';
import { useParams } from 'next/navigation';
import MoveList from '@/components/MoveList';
import { useGameContext } from '@/context/GameContext';
import { Chess } from 'chess.js';

const Home: React.FC = () => {

    return (
        <div className="bg-background p-4 md:p-8">
            <div className="max-w-9xl mx-auto space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Chess Analysis Board</h1>
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-9xl w-full">
                        <div className="space-y-8 lg:col-span-1">
                            <Chessboard />
                        </div>
                        <div className="space-y-8 lg:col-span-1">
                            <MoveList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
