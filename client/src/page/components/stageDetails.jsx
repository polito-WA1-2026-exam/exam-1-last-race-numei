import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'

export const stageDetails = {
  setup: {
    icon: <MapOutlinedIcon />,
    title: 'Setup',
    subtitle: 'Review the full underground network before starting a new race.',
    chips: ['Full map', 'Stations', 'Lines', 'Segments'],
  },
  planning: {
    icon: <RouteOutlinedIcon />,
    title: 'Planning',
    subtitle: 'Choose the route with hidden line information before the timer expires.',
    chips: ['90 seconds', 'No duplicated segments', 'Destination check'],
  },
  execution: {
    icon: <PlayArrowOutlinedIcon />,
    title: 'Execution',
    subtitle: 'Reveal one step at a time, apply events, and update the coin total.',
    chips: ['Step by step', 'Random events', 'Coin updates'],
  },
  result: {
    icon: <FlagOutlinedIcon />,
    title: 'Result',
    subtitle: 'Show the final score and let the player start another race.',
    chips: ['Final score', 'Outcome', 'Restart'],
  },
  ranking: {
    icon: <EmojiEventsOutlinedIcon />,
    title: 'Ranking',
    subtitle: 'Compare the best score achieved by each registered player.',
    chips: ['Protected route', 'Best scores', 'Registered users'],
  },
}
