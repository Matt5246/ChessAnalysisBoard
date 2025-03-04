'use client';

import Chessboard from '@/components/chessboard';
import EvalBar from '@/components/EvaluationBar';
import MoveList from '@/components/MoveList';

const Home: React.FC = () => {
    return (
        <div className="bg-background  p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 max-h-[78vh]">
                    <div className="flex-1 flex justify-center items-center relative">
                        <div className="w-full flex ml-4">
                            <EvalBar evaluation={-120} />
                            <div className="flex-1 aspect-square">
                                <Chessboard />
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-1/3 my-2 md:my-32">
                        <MoveList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;