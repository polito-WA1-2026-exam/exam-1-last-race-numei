import { Link as RouterLink, useParams } from 'react-router'
import { Button, Typography } from '@mui/material'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import { StagePage } from './components/StagePage.jsx'
import { stageDetails } from './components/stageDetails.jsx'

export function PlanningPage() {
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
