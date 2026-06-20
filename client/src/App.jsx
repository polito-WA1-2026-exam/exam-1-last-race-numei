import { useEffect, useMemo, useState } from 'react'
import {
  Link as RouterLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { API } from './api.js'
import { AuthContext, useAuth } from './AuthContext.js'
import { appTheme } from './theme.js'
import './App.css'

const instructionItems = [
  'Each game starts with 20 coins.',
  'The server assigns a start station and a destination station.',
  'During planning, connected lines are hidden and only station names are visible.',
  'Each segment may be selected only once.',
  'Registered users can play multiple games and appear in the ranking.',
]

const stageDetails = {
  setup: {
    icon: <MapOutlinedIcon />,
    title: 'Setup',
    subtitle: 'Review the full underground network before starting a new race.',
    chips: ['Full map', 'Stations', 'Lines', 'Segments'],
  },
  planning: {
    icon: <RouteOutlinedIcon />,
    title: 'Planning',
    subtitle: 'Choose the route with hidden line information before the timer expires.',
    chips: ['90 seconds', 'No duplicated segments', 'Destination check'],
  },
  execution: {
    icon: <PlayArrowOutlinedIcon />,
    title: 'Execution',
    subtitle: 'Reveal one step at a time, apply events, and update the coin total.',
    chips: ['Step by step', 'Random events', 'Coin updates'],
  },
  result: {
    icon: <FlagOutlinedIcon />,
    title: 'Result',
    subtitle: 'Show the final score and let the player start another race.',
    chips: ['Final score', 'Outcome', 'Restart'],
  },
  ranking: {
    icon: <EmojiEventsOutlinedIcon />,
    title: 'Ranking',
    subtitle: 'Compare the best score achieved by each registered player.',
    chips: ['Protected route', 'Best scores', 'Registered users'],
  },
}

function App() {
  const [user, setUser] = useState(undefined)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let ignore = false

    API.getCurrentUser()
      .then((currentUser) => {
        if (!ignore) setUser(currentUser)
      })
      .catch(() => {
        if (!ignore) setUser(undefined)
      })
      .finally(() => {
        if (!ignore) setCheckingSession(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const auth = useMemo(
    () => ({
      user,
      checkingSession,
      login: async (credentials) => {
        const loggedUser = await API.login(credentials)
        setUser(loggedUser)
        return loggedUser
      },
      logout: async () => {
        await API.logout()
        setUser(undefined)
      },
    }),
    [checkingSession, user],
  )

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route element={<MainLayout />}>
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
      </AuthContext.Provider>
    </ThemeProvider>
  )
}

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <Box className="app-shell">
      <AppBar position="sticky" elevation={0} color="inherit">
        <Toolbar
          sx={{
            gap: 2,
            minHeight: { xs: 64, sm: 72 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            component={RouterLink}
            to={user ? '/setup' : '/'}
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: 'center',
              color: 'text.primary',
              flexGrow: 1,
              minWidth: 0,
              textDecoration: 'none',
            }}
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
                  onClick={handleLogout}
                  startIcon={<LogoutOutlinedIcon />}
                  variant="outlined"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                component={RouterLink}
                startIcon={<LoginOutlinedIcon />}
                to="/login"
                variant="contained"
              >
                Login
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            {user ? (
              <>
                <IconButton aria-label="Go to setup" component={RouterLink} to="/setup">
                  <MapOutlinedIcon />
                </IconButton>
                <IconButton aria-label="Go to ranking" component={RouterLink} to="/ranking">
                  <EmojiEventsOutlinedIcon />
                </IconButton>
                <IconButton aria-label="Logout" onClick={handleLogout}>
                  <LogoutOutlinedIcon />
                </IconButton>
              </>
            ) : (
              <IconButton aria-label="Login" color="primary" component={RouterLink} to="/login">
                <LoginOutlinedIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

function ProtectedRoute() {
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

function InstructionsPage() {
  const { user } = useAuth()

  return (
    <PagePanel
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={user ? <MapOutlinedIcon /> : <LoginOutlinedIcon />}
          to={user ? '/setup' : '/login'}
          variant="contained"
        >
          {user ? 'Go to setup' : 'Login to play'}
        </Button>
      }
      icon={<RouteOutlinedIcon />}
      subtitle="Plan a route through the underground network, execute it step by step, and keep as many coins as possible."
      title="Game Instructions"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
        }}
      >
        <Stack spacing={2.5}>
          <InfoTile icon={<TimerOutlinedIcon />} label="Planning time" value="90 seconds" />
          <InfoTile icon={<FlagOutlinedIcon />} label="Initial coins" value="20 coins" />
          <InfoTile
            icon={<EmojiEventsOutlinedIcon />}
            label="Ranking"
            value="Best score per user"
          />
        </Stack>
        <Box>
          <Typography color="text.secondary" sx={{ mb: 1 }} variant="overline">
            Core rules
          </Typography>
          <List dense disablePadding>
            {instructionItems.map((item) => (
              <ListItem disableGutters key={item} sx={{ alignItems: 'flex-start', py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 34, pt: 0.5 }}>
                  <Box className="rule-dot" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  slotProps={{
                    primary: {
                      sx: {
                        color: 'text.secondary',
                        lineHeight: 1.55,
                      },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </PagePanel>
  )
}

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/setup" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(credentials)
      navigate(location.state?.from?.pathname ?? '/setup', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field) => (event) => {
    setCredentials((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  return (
    <PagePanel
      icon={<LoginOutlinedIcon />}
      subtitle="Use one of the seeded exam accounts to enter the protected game routes."
      title="Login"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'grid',
          gap: 2,
          maxWidth: 420,
        }}
      >
        <TextField
          autoComplete="username"
          label="Username"
          onChange={handleChange('username')}
          required
          value={credentials.username}
        />
        <TextField
          autoComplete="current-password"
          label="Password"
          onChange={handleChange('password')}
          required
          type="password"
          value={credentials.password}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          disabled={submitting}
          size="large"
          startIcon={submitting ? <CircularProgress color="inherit" size={18} /> : <LoginOutlinedIcon />}
          type="submit"
          variant="contained"
        >
          Login
        </Button>
      </Box>
    </PagePanel>
  )
}

function SetupPage() {
  return (
    <StagePage
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={<RouteOutlinedIcon />}
          to="/games/new/planning"
          variant="contained"
        >
          Start planning
        </Button>
      }
      details={stageDetails.setup}
    >
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        This route will load all stations, segments, and line information from the
        protected API. The player can inspect the complete network before starting
        the timed planning phase.
      </Typography>
    </StagePage>
  )
}

function PlanningPage() {
  const { gameId } = useParams()

  return (
    <StagePage
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={<PlayArrowOutlinedIcon />}
          to={`/games/${gameId}/execution`}
          variant="contained"
        >
          Submit route
        </Button>
      }
      details={stageDetails.planning}
      gameId={gameId}
    >
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        The page will show a stations-only map, the assigned start and destination,
        a selectable segment list, the selected route, and the countdown timer.
      </Typography>
    </StagePage>
  )
}

function ExecutionPage() {
  const { gameId } = useParams()

  return (
    <StagePage
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={<FlagOutlinedIcon />}
          to={`/games/${gameId}/result`}
          variant="contained"
        >
          View result
        </Button>
      }
      details={stageDetails.execution}
      gameId={gameId}
    >
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        Execution steps will be shown one at a time with the random event and the
        updated coin total returned by the server.
      </Typography>
    </StagePage>
  )
}

function ResultPage() {
  const { gameId } = useParams()

  return (
    <StagePage
      action={
        <Button component={RouterLink} size="large" to="/setup" variant="contained">
          Start another game
        </Button>
      }
      details={stageDetails.result}
      gameId={gameId}
    >
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        This page will present the final score, the final station reached, and the
        action for starting another game.
      </Typography>
    </StagePage>
  )
}

function RankingPage() {
  return (
    <StagePage details={stageDetails.ranking}>
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        This protected route will show the best score for each registered user,
        ordered from the highest score to the lowest.
      </Typography>
    </StagePage>
  )
}

function NotFoundPage() {
  return (
    <PagePanel
      action={
        <Button component={RouterLink} to="/" variant="contained">
          Back to instructions
        </Button>
      }
      icon={<FlagOutlinedIcon />}
      subtitle="The requested route does not exist."
      title="Page Not Found"
    />
  )
}

function StagePage({ action, children, details, gameId }) {
  return (
    <PagePanel action={action} icon={details.icon} subtitle={details.subtitle} title={details.title}>
      <Stack spacing={3}>
        {gameId && (
          <Chip
            color="secondary"
            label={`Game ${gameId}`}
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          />
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {details.chips.map((chip) => (
            <Chip key={chip} label={chip} variant="outlined" />
          ))}
        </Stack>
        <Divider />
        {children}
      </Stack>
    </PagePanel>
  )
}

function InfoTile({ icon, label, value }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        gap: 1.5,
        px: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{icon}</Box>
      <Box>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Box>
  )
}

function PagePanel({ action, children, icon, subtitle, title }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        maxWidth: 860,
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            {icon && (
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  color: 'primary.main',
                  display: 'inline-flex',
                  flexShrink: 0,
                  height: 48,
                  justifyContent: 'center',
                  width: 48,
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography component="h1" variant="h3">
                {title}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }} variant="body1">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {children}
          {action && <Box>{action}</Box>}
        </Stack>
      </Box>
    </Paper>
  )
}

export default App
