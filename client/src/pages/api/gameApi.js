import { request } from './request.js'

export const GameApi = {
  getNetwork: () => request('/network'),
  startGame: () => request('/games', { method: 'POST' }),
  submitRoute: (gameId, route) =>
    request(`/games/${gameId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ route }),
    }),
  getResult: (gameId) => request(`/games/${gameId}/result`),
  getRanking: () => request('/ranking'),
}
