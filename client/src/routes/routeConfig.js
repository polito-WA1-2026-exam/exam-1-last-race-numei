export const routes = [
  { path: '/', label: 'Instructions', protected: false },
  { path: '/login', label: 'Login', protected: false },
  { path: '/setup', label: 'Setup', protected: true },
  { path: '/games/:gameId/planning', label: 'Planning', protected: true },
  { path: '/games/:gameId/execution', label: 'Execution', protected: true },
  { path: '/games/:gameId/result', label: 'Result', protected: true },
  { path: '/ranking', label: 'Ranking', protected: true },
  { path: '*', label: 'Not found', protected: false },
]
