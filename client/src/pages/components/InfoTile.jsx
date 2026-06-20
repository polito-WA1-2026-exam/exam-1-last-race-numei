import { Box, Typography } from '@mui/material'

export function InfoTile({ icon, label, value }) {
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
