import { Link as RouterLink } from 'react-router'
import { Button, Typography } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { StagePage } from './components/StagePage.jsx'
import { stageDetails } from './components/stageDetails.jsx'

export function SetupPage() {
  return (
    <StagePage
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={<RouteOutlinedIcon />}
          to="/games/new/planning"
          variant="contained"
        >
          Start planning
        </Button>
      }
      details={stageDetails.setup}
    >
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        This route will load all stations, segments, and line information from the
        protected API. The player can inspect the complete network before starting
        the timed planning phase.
      </Typography>
    </StagePage>
  )
}
