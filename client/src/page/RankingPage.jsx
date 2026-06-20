import { Typography } from '@mui/material'
import { StagePage } from './components/StagePage.jsx'
import { stageDetails } from './components/stageDetails.jsx'

export function RankingPage() {
  return (
    <StagePage details={stageDetails.ranking}>
      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
        This protected route will show the best score for each registered user,
        ordered from the highest score to the lowest.
      </Typography>
    </StagePage>
  )
}
