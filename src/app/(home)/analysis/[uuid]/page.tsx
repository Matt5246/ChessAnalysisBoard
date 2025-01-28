'use client';

import Chessboard from '@/components/chessboard';
import MoveList from '@/components/MoveList';

const Home: React.FC = () => {

    return (
        <div className="bg-background md:p-8 flex flex-col md:flex-row justify-center">
            <div className="md:w-3/5 w-full">
                <Chessboard />
            </div>
            <div className="md:w-1/5 w-full md:ml-4 mt-4 md:mt-0 md:order-last">
                <MoveList />
            </div>
        </div>
    );
};

export default Home;
