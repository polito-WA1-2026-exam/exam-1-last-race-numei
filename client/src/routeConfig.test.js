import test from 'node:test'
import assert from 'node:assert/strict'
import { routes } from './routeConfig.js'

test('client routes match the README game flow', () => {
  assert.deepEqual(
    routes.map((route) => route.path),
    [
      '/',
      '/login',
      '/setup',
      '/games/:gameId/planning',
      '/games/:gameId/execution',
      '/games/:gameId/result',
      '/ranking',
      '*',
    ],
  )
})

test('only instructions and login are public routes', () => {
  const publicRoutes = routes
    .filter((route) => !route.protected)
    .map((route) => route.path)

  assert.deepEqual(publicRoutes, ['/', '/login', '*'])
})
