import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const gamesPeriod = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

function padMonth(month: number): string {
  return month.toString().padStart(2, "0");
}

function updateGamesPeriod() {
  const gameSelectPeriod = document.getElementById("game-select-period");
  if (gameSelectPeriod) {
    gameSelectPeriod.textContent = `${padMonth(gamesPeriod.month)}/${gamesPeriod.year}`;
  }
}

function getPlayersString(game: any): string {
  if (game.white.aiLevel) {
    return `AI level ${game.white.aiLevel} vs. ${game.black.username} (${game.black.rating})`;
  } else if (game.black.aiLevel) {
    return `${game.white.username} (${game.white.rating}) vs. AI level ${game.black.aiLevel}`;
  } else {
    return `${game.white.username} (${game.white.rating}) vs. ${game.black.username} (${game.black.rating})`;
  }
}

function generateGameListing(game: any): HTMLElement {
  const listingContainer = document.createElement("div");
  listingContainer.className = "game-listing";
  listingContainer.dataset.pgn = game.pgn;

  listingContainer.addEventListener("click", () => {
    const pgnInput = document.getElementById("pgn") as HTMLInputElement;
    if (pgnInput) pgnInput.value = game.pgn || "";
    const reviewButton = document.getElementById("review-button");
    if (reviewButton) reviewButton.classList.remove("review-button-disabled");
    closeModal();
  });

  const timeClass = document.createElement("b");
  timeClass.textContent = game.timeClass.charAt(0).toUpperCase() + game.timeClass.slice(1);

  const players = document.createElement("span");
  players.textContent = getPlayersString(game);

  listingContainer.append(timeClass, players);

  return listingContainer;
}

async function fetchChessComGames(username: string) {
  const gamesList = document.getElementById("games-list");

  try {
    const response = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${gamesPeriod.year}/${padMonth(gamesPeriod.month)}`
    );
    const data = await response.json();
    const games = data.games || [];

    if (gamesList) {
      gamesList.innerHTML = games.length === 0 ? "No games found." : "";

      for (const game of games.reverse()) {
        const gameListing = generateGameListing({
          white: { username: game.white.username, rating: game.white.rating },
          black: { username: game.black.username, rating: game.black.rating },
          timeClass: game.time_class,
          pgn: game.pgn,
        });

        gamesList.appendChild(gameListing);
      }
    }
  } catch (error) {
    if (gamesList) gamesList.innerHTML = "No games found.";
  }
}

function closeModal() {
  const modalContainer = document.getElementById("game-select-menu-container");
  if (modalContainer) modalContainer.style.display = "none";

  const today = new Date();
  gamesPeriod.year = today.getFullYear();
  gamesPeriod.month = today.getMonth() + 1;
  updateGamesPeriod();
}

function registerModalEvents() {
  const cancelButton = document.getElementById("game-select-cancel-button");
  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }

  const lastPageButton = document.getElementById("last-page-button");
  if (lastPageButton) {
    lastPageButton.addEventListener("click", () => {
      gamesPeriod.month--;
      if (gamesPeriod.month < 1) {
        gamesPeriod.month = 12;
        gamesPeriod.year--;
      }

      const usernameInput = document.getElementById("chess-site-username") as HTMLInputElement;
      const username = usernameInput?.value || "";

      fetchChessComGames(username);
      updateGamesPeriod();
    });
  }

  const nextPageButton = document.getElementById("next-page-button");
  if (nextPageButton) {
    nextPageButton.addEventListener("click", () => {
      if (gamesPeriod.month === 12 && gamesPeriod.year >= new Date().getFullYear()) return;

      gamesPeriod.month++;
      if (gamesPeriod.month > 12) {
        gamesPeriod.month = 1;
        gamesPeriod.year++;
      }

      const usernameInput = document.getElementById("chess-site-username") as HTMLInputElement;
      const username = usernameInput?.value || "";

      fetchChessComGames(username);
      updateGamesPeriod();
    });
  }
}

function setupFetchButton() {
  const fetchButton = document.getElementById("fetch-account-games-button");
  if (fetchButton) {
    fetchButton.addEventListener("click", () => {
      const gamesList = document.getElementById("games-list");
      if (gamesList) gamesList.innerHTML = "Fetching games...";
      const modalContainer = document.getElementById("game-select-menu-container");
      if (modalContainer) modalContainer.style.display = "flex";

      updateGamesPeriod();

      const usernameInput = document.getElementById("chess-site-username") as HTMLInputElement;
      const username = usernameInput?.value || "";

      fetchChessComGames(username);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  registerModalEvents();
  setupFetchButton();
});

export { 
  fetchChessComGames, 
  updateGamesPeriod, 
  closeModal, 
  registerModalEvents, 
  padMonth, 
  getPlayersString, 
  generateGameListing 
};
