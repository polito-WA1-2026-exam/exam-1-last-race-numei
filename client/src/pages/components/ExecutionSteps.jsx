import { useState } from 'react'
import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined'

const formatEffect = (effect) => {
  if (effect > 0) return `+${effect}`
  return `${effect}`
}

export function ExecutionSteps({ onFinish, result, stationById }) {
  const [visibleIndex, setVisibleIndex] = useState(0)
  const steps = result?.steps ?? []
  const currentStep = steps[visibleIndex]
  const progress = steps.length > 0 ? ((visibleIndex + 1) / steps.length) * 100 : 0
  const isLastStep = visibleIndex >= steps.length - 1

  if (!currentStep) return null

  const fromStation = stationById.get(currentStep.fromStationId)
  const toStation = stationById.get(currentStep.toStationId)

  const handleNext = () => {
    if (isLastStep) onFinish()
    else setVisibleIndex((current) => current + 1)
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography color="text.secondary" variant="overline">
          Step {currentStep.order} of {steps.length}
        </Typography>
        <Typography variant="h5">
          {fromStation?.name}
          {' -> '}
          {toStation?.name}
        </Typography>
      </Box>

      <LinearProgress value={progress} variant="determinate" />

      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip
            color={currentStep.event.effect >= 0 ? 'success' : 'warning'}
            label={`${formatEffect(currentStep.event.effect)} coins`}
          />
          <Typography sx={{ fontWeight: 700 }}>{currentStep.event.description}</Typography>
        </Stack>
        <Typography color="text.secondary">
          Coin total after this segment: {currentStep.coins}
        </Typography>
      </Box>

      <Button
        onClick={handleNext}
        size="large"
        startIcon={<NavigateNextOutlinedIcon />}
        variant="contained"
      >
        {isLastStep ? 'Show final result' : 'Reveal next step'}
      </Button>
    </Stack>
  )
}
