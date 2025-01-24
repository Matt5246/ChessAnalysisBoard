import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Game {
    url: string;
    white: { username: string; result: string };
    black: { username: string; result: string };
    pgn: string; 
}

interface GamesState {
    games: Game[];
    error: string | null;
}

const loadGamesFromLocalStorage = (): GamesState => {
    try {
        const savedGames = localStorage.getItem("games");
        if (savedGames) {
            return { games: JSON.parse(savedGames), error: null };
        }
    } catch (err) {
        console.error("Failed to load games from localStorage:", err);
    }
    return { games: [], error: null }; 
};

const initialState = loadGamesFromLocalStorage();

const gamesSlice = createSlice({
    name: "games",
    initialState,
    reducers: {
        setGames: (state, action: PayloadAction<Game[]>) => {
            state.games = action.payload;
            try {
                localStorage.setItem("games", JSON.stringify(action.payload));
            } catch (err) {
                console.error("Failed to save games to localStorage:", err);
            }
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setGames, setError } = gamesSlice.actions;

export default gamesSlice.reducer;
