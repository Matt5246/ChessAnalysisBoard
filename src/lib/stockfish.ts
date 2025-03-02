let stockfish: Worker | null = null;

if (typeof window !== "undefined") {
    try {
      stockfish = new Worker("/stockfish.js");
    } catch (error) {
      console.error("Failed to initialize Stockfish worker:", error);
    }
  }

export type EngineMessage = {
  uciMessage: string;
  bestMove?: string;
  ponder?: string;
  positionEvaluation?: string;
  possibleMate?: string;
  pv?: string;
  depth: number;
  multipv: number;
  wdl?: number[];
};

export default class Engine {
  stockfish: Worker | null;
  onMessage: (callback: (messageData: EngineMessage) => void) => void;
  isReady: boolean;

  constructor() {
    if (!stockfish) {
        console.warn("Stockfish Worker is not initialized yet.");
        throw new Error("Stockfish Worker is not initialized.");
      }

    this.stockfish = stockfish;
    this.isReady = false;
    this.onMessage = (callback) => {
      if (!this.stockfish) return;
      this.stockfish.addEventListener("message", (e) => {
        callback(this.messageData(e));
      });
    };
    this.init();
  }

  private messageData(e: MessageEvent | string): EngineMessage {
    const uciMessage = e instanceof MessageEvent ? e.data : e;

    return {
      uciMessage,
      bestMove: uciMessage.match(/bestmove\s+(\S+)/)?.[1],
      ponder: uciMessage.match(/ponder\s+(\S+)/)?.[1],
      positionEvaluation: uciMessage.match(/cp\s+(\S+)/)?.[1],
      possibleMate: uciMessage.match(/mate\s+(\S+)/)?.[1],
      pv: uciMessage.match(/ pv\s+(.*)/)?.[1],
      depth: Number(uciMessage.match(/ depth\s+(\S+)/)?.[1]) ?? 0,
      multipv: Number(uciMessage.match(/ multipv\s+(\S+)/)?.[1]) ?? 1, // Extract multipv value
      wdl: uciMessage.match(/wdl\s+(\d+)\s+(\d+)\s+(\d+)/)?.slice(1).map(Number), // Extract WDL
    };
  }

  init() {
    if (!this.stockfish) return;
    this.stockfish.postMessage("uci");
    this.stockfish.postMessage("isready");
    this.stockfish.postMessage("setoption name MultiPV value 3");
    this.stockfish.postMessage("setoption name UCI_showWDL value true");

    this.onMessage(({ uciMessage }) => {
      if (uciMessage === "readyok") {
        this.isReady = true;
      }
    });
  }

  onReady(callback: () => void) {
    this.onMessage(({ uciMessage }) => {
      if (uciMessage === "readyok") {
        callback();
      }
    });
  }

  evaluatePosition(fen: string, depth: number) {
    if (depth > 24) depth = 24;

    if (this.stockfish) {
      this.stockfish.postMessage(`position fen ${fen}`);
      this.stockfish.postMessage(`go depth ${depth}`);
    }
  }

  stop() {
    if (this.stockfish) {
      this.stockfish.postMessage("stop");
    }
  }

  terminate() {
    this.isReady = false;
    if (this.stockfish) {
      this.stockfish.postMessage("quit");
    }
  }
}
