import { useEffect } from 'react'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import { Alert } from '@mui/material'
import { PagePanel } from './components/PagePanel.jsx'
import { RankingTable } from './components/RankingTable.jsx'
import { StatusPanel } from './components/StatusPanel.jsx'
import { useGame } from './hooks/useGame.js'

export function RankingPage() {
  const { loadRanking, ranking, rankingStatus } = useGame()

  useEffect(() => {
    loadRanking().catch(() => {})
  }, [loadRanking])

  return (
    <PagePanel
      icon={<EmojiEventsOutlinedIcon />}
      subtitle="Best score achieved by each registered player."
      title="Ranking"
    >
      <StatusPanel error={rankingStatus.error} loading={rankingStatus.loading} />
      {!rankingStatus.loading && ranking.length === 0 && (
        <Alert severity="info">No completed games are available yet.</Alert>
      )}
      {ranking.length > 0 && <RankingTable rows={ranking} />}
    </PagePanel>
  )
}
