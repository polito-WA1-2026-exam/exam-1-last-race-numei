import { Alert, CircularProgress, Stack, Typography } from '@mui/material'

export function StatusPanel({ error, loading, message = 'Loading...' }) {
  if (loading) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>

  return null
}
