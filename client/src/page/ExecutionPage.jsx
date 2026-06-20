import { Link as RouterLink, useParams } from 'react-router'
import { Button, Typography } from '@mui/material'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { StagePage } from './components/StagePage.jsx'
import { stageDetails } from './components/stageDetails.jsx'

export function ExecutionPage() {
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
