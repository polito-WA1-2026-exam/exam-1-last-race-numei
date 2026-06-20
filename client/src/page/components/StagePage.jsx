import { Chip, Divider, Stack } from '@mui/material'
import { PagePanel } from './PagePanel.jsx'

export function StagePage({ action, children, details, gameId }) {
  return (
    <PagePanel action={action} icon={details.icon} subtitle={details.subtitle} title={details.title}>
      <Stack spacing={3}>
        {gameId && (
          <Chip
            color="secondary"
            label={`Game ${gameId}`}
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          />
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {details.chips.map((chip) => (
            <Chip key={chip} label={chip} variant="outlined" />
          ))}
        </Stack>
        <Divider />
        {children}
      </Stack>
    </PagePanel>
  )
}
