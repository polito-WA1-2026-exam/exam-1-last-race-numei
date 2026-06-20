import { Link as RouterLink, useParams } from 'react-router'
import { Button, Typography } from '@mui/material'
import { StagePage } from './components/StagePage.jsx'
import { stageDetails } from './components/stageDetails.jsx'

export function ResultPage() {
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
