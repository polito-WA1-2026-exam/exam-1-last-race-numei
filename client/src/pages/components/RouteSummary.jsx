import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'

export function RouteSummary({
  canEdit = true,
  currentStation,
  destinationStation,
  onClear,
  onRemoveLast,
  routeSteps = [],
  startStation,
}) {
  const reachedDestination = currentStation?.id === destinationStation?.id

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Selected route</Typography>
        <Typography color="text.secondary" variant="body2">
          Start at {startStation?.name}; current station is {currentStation?.name}.
        </Typography>
      </Box>

      {routeSteps.length === 0 ? (
        <Alert severity="info">No segment selected yet.</Alert>
      ) : (
        <Stack spacing={1}>
          {routeSteps.map((step) => (
            <Box
              key={`${step.order}-${step.segmentId}`}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                px: 1.5,
                py: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                {step.order}. {step.fromStation?.name}
                {' -> '}
                {step.toStation?.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip
          color={reachedDestination ? 'success' : 'default'}
          label={reachedDestination ? 'Destination reached' : `Destination: ${destinationStation?.name}`}
        />
        <Chip label={`${routeSteps.length} segment${routeSteps.length === 1 ? '' : 's'}`} />
      </Stack>

      {canEdit && (
        <Stack direction="row" spacing={1}>
          <Button
            disabled={routeSteps.length === 0}
            onClick={onRemoveLast}
            startIcon={<BackspaceOutlinedIcon />}
            variant="outlined"
          >
            Undo
          </Button>
          <Button
            color="inherit"
            disabled={routeSteps.length === 0}
            onClick={onClear}
            startIcon={<DeleteSweepOutlinedIcon />}
            variant="outlined"
          >
            Clear
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
