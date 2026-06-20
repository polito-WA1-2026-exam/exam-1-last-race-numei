import { Navigate, Outlet, useLocation } from 'react-router'
import { CircularProgress, Stack, Typography } from '@mui/material'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { useAuth } from '../hooks/useAuth.js'
import { PagePanel } from './PagePanel.jsx'

export function ProtectedRoute() {
  const { user, checkingSession } = useAuth()
  const location = useLocation()

  if (checkingSession) {
    return (
      <PagePanel icon={<TimerOutlinedIcon />} title="Loading">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">Checking session...</Typography>
        </Stack>
      </PagePanel>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
