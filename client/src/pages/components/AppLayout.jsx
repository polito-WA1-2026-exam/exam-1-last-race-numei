import { useMemo, useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router'
import {
  AppBar,
  Box,
  Button,
  Container,
  CircularProgress,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import { useAuth } from '../hooks/useAuth.js'
import { throttle } from '../util.js'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = useMemo(
    () =>
      throttle(async () => {
        if (loggingOut) return
        setLoggingOut(true)

        try {
          await logout()
        } catch {
          // Keep the UI usable even if the API server is unavailable.
        } finally {
          setLoggingOut(false)
          navigate('/')
        }
      }, 1000),
    [loggingOut, logout, navigate],
  )

  return (
    <Box className="app-shell">
      <AppBar position="sticky" elevation={0} color="inherit">
        <Toolbar
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            gap: 2,
            minHeight: { xs: 64, sm: 72 },
          }}
        >
          <BrandLink user={user} />
          <DesktopNavigation loggingOut={loggingOut} user={user} onLogout={handleLogout} />
          <MobileNavigation loggingOut={loggingOut} user={user} onLogout={handleLogout} />
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

function BrandLink({ user }) {
  return (
    <Stack
      component={RouterLink}
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: 'center',
        color: 'text.primary',
        flexGrow: 1,
        minWidth: 0,
        textDecoration: 'none',
      }}
      to={user ? '/setup' : '/'}
    >
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: 1.5,
          color: 'primary.contrastText',
          display: 'inline-flex',
          height: 38,
          justifyContent: 'center',
          width: 38,
        }}
      >
        <AccountTreeOutlinedIcon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap variant="h6">
          Last Race
        </Typography>
        <Typography color="text.secondary" noWrap variant="caption">
          Underground route challenge
        </Typography>
      </Box>
    </Stack>
  )
}

function DesktopNavigation({ loggingOut, user, onLogout }) {
  return (
    <Stack
      component="nav"
      direction="row"
      spacing={1}
      sx={{ display: { xs: 'none', sm: 'flex' } }}
    >
      {user ? (
        <>
          <Button component={RouterLink} to="/setup" variant="text">
            Setup
          </Button>
          <Button component={RouterLink} to="/ranking" variant="text">
            Ranking
          </Button>
          <Button
            color="inherit"
            disabled={loggingOut}
            onClick={onLogout}
            startIcon={
              loggingOut ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <LogoutOutlinedIcon />
              )
            }
            variant="outlined"
          >
            Logout
          </Button>
        </>
      ) : (
        <Button component={RouterLink} startIcon={<LoginOutlinedIcon />} to="/login" variant="contained">
          Login
        </Button>
      )}
    </Stack>
  )
}

function MobileNavigation({ loggingOut, user, onLogout }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
      {user ? (
        <>
          <IconButton aria-label="Go to setup" component={RouterLink} to="/setup">
            <MapOutlinedIcon />
          </IconButton>
          <IconButton aria-label="Go to ranking" component={RouterLink} to="/ranking">
            <EmojiEventsOutlinedIcon />
          </IconButton>
          <IconButton aria-label="Logout" disabled={loggingOut} onClick={onLogout}>
            {loggingOut ? <CircularProgress color="inherit" size={20} /> : <LogoutOutlinedIcon />}
          </IconButton>
        </>
      ) : (
        <IconButton aria-label="Login" color="primary" component={RouterLink} to="/login">
          <LoginOutlinedIcon />
        </IconButton>
      )}
    </Stack>
  )
}
