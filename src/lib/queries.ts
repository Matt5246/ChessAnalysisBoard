import axios from 'axios'

export const getPlayerGames = async (player: {
  username: string
  month: number
  year: number
}) => {
  const { username, month, year } = player
  const response = await axios.get(
    `https://api.chess.com/pub/player/${username}/games/${year}/${month}`
  )
  return response.data
}
