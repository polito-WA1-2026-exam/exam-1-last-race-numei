import { Link as RouterLink } from 'react-router'
import { Button } from '@mui/material'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { PagePanel } from './components/PagePanel.jsx'

export function NotFoundPage() {
  return (
    <PagePanel
      action={
        <Button component={RouterLink} to="/" variant="contained">
          Back to instructions
        </Button>
      }
      icon={<FlagOutlinedIcon />}
      subtitle="The requested route does not exist."
      title="Page Not Found"
    />
  )
}
