import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'

export function RouteSummary({
  canEdit = true,
  destinationStation,
  onClear,
  onRemoveLast,
  onRemoveSegment,
  routeSteps = [],
  startStation,
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Selected route</Typography>
        <Typography color="text.secondary" variant="body2">
          Start at {startStation?.name}.
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
                alignItems: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                display: 'flex',
                gap: 1,
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                {step.order}. {step.segment?.stationAName} - {step.segment?.stationBName}
              </Typography>
              {canEdit && (
                <Tooltip title="Remove segment">
                  <span>
                    <IconButton
                      aria-label={`Remove ${step.segment?.stationAName} - ${step.segment?.stationBName}`}
                      color="error"
                      onClick={() => onRemoveSegment(step.segmentId)}
                      size="small"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`Destination: ${destinationStation?.name}`} />
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
