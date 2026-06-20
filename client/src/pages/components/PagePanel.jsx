import { Box, Paper, Stack, Typography } from '@mui/material'

export function PagePanel({ action, children, icon, subtitle, title }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        maxWidth: 1100,
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: 'background.paper', p: { xs: 3, sm: 4 } }}>
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
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
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
