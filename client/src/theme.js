import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    primary: {
      main: '#2457d6',
      light: '#e8eefc',
      dark: '#173f9e',
      contrastText: '#ffffff',
      50: '#eef4ff',
    },
    secondary: {
      main: '#147d63',
      light: '#e6f5ef',
      dark: '#0f5f4b',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#172033',
      secondary: '#5b667a',
    },
    divider: '#d9e0ec',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.1,
    },
    h6: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: 'none',
    },
    overline: {
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
})
