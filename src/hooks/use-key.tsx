import { useEffect } from 'react';

const useKey = (key: string, action: () => void) => {
    useEffect(() => {
        const onKeyup = (e: KeyboardEvent) => {
            if (e.key === key) action();
        };

        window.addEventListener('keyup', onKeyup);
        return () => window.removeEventListener('keyup', onKeyup);
    }, [key, action]);
};

export default useKey;