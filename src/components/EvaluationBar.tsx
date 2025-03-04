interface EvalBarProps {
    evaluation: number;
}

export default function EvalBar({ evaluation }: EvalBarProps) {
    // Normalize evaluation: -1000 (Black winning) → 0%, 1000 (White winning) → 100%
    const normalizeEval = (cp: number) => {
        return Math.max(0, Math.min(100, ((cp + 1000) / 2000) * 100));
    };

    const progress = normalizeEval(evaluation);

    // Convert cp to a proper format: 23 → "+0.23", -87 → "-0.87"
    const evalText = (evaluation / 100).toFixed(2);

    return (
        <div className="flex flex-col justify-center shadow-lg text-white text-center  w-9 mr-5">
            <div className="relative flex-1 w-full bg-gray-300 rounded overflow-hidden">
                <div
                    className="absolute bottom-0 w-full bg-white transition-all duration-300"
                    style={{ height: `${progress}%` }}
                ></div>
                <div
                    className="absolute top-0 w-full bg-gray-900 transition-all duration-300"
                    style={{ height: `${100 - progress}%` }}
                ></div>
                {/* <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 text-black font-bold text-xs bg-gray-300 rounded-lg px-1">
                    {evalText}
                </div> */}
            </div>
        </div>
    );
}
