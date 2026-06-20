import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppLayout } from './pages/components/AppLayout.jsx'
import { ProtectedRoute } from './pages/components/ProtectedRoute.jsx'
import { AuthContext } from './pages/hooks/useAuth.js'
import { GameProvider } from './pages/hooks/useGame.js'
import { useAuthSession } from './pages/hooks/useAuthSession.js'
import { appTheme } from './theme.js'
import './App.css'

const lazyPage = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })))

const ExecutionPage = lazyPage(() => import('./pages/ExecutionPage.jsx'), 'ExecutionPage')
const InstructionsPage = lazyPage(() => import('./pages/InstructionsPage.jsx'), 'InstructionsPage')
const LoginPage = lazyPage(() => import('./pages/LoginPage.jsx'), 'LoginPage')
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage.jsx'), 'NotFoundPage')
const PlanningPage = lazyPage(() => import('./pages/PlanningPage.jsx'), 'PlanningPage')
const RankingPage = lazyPage(() => import('./pages/RankingPage.jsx'), 'RankingPage')
const ResultPage = lazyPage(() => import('./pages/ResultPage.jsx'), 'ResultPage')
const SetupPage = lazyPage(() => import('./pages/SetupPage.jsx'), 'SetupPage')

function App() {
  const auth = useAuthSession()

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthContext.Provider value={auth}>
        <GameProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<InstructionsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="setup" element={<SetupPage />} />
                  <Route path="games/:gameId/planning" element={<PlanningPage />} />
                  <Route path="games/:gameId/execution" element={<ExecutionPage />} />
                  <Route path="games/:gameId/result" element={<ResultPage />} />
                  <Route path="ranking" element={<RankingPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </GameProvider>
      </AuthContext.Provider>
    </ThemeProvider>
  )
}

function RouteFallback() {
  return (
    <Box sx={{ display: 'grid', minHeight: 320, placeItems: 'center' }}>
      <CircularProgress size={28} />
    </Box>
  )
}

export default App
