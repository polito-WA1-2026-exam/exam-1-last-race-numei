import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { Link as RouterLink } from "react-router";
import { InfoTile } from "./components/InfoTile.jsx";
import { PagePanel } from "./components/PagePanel.jsx";
import { useAuth } from "../hooks/useAuth.js";

const instructionItems = [
  "Each game starts with 20 coins.",
  "The server assigns a start station and a destination station.",
  "During planning, connected lines are hidden and only station names are visible.",
  "Each segment may be selected only once.",
  "Registered users can play multiple games and appear in the ranking.",
];

export function InstructionsPage() {
  const { user } = useAuth();

  return (
    <PagePanel
      action={
        <Button
          component={RouterLink}
          size="large"
          startIcon={user ? <MapOutlinedIcon /> : <LoginOutlinedIcon />}
          to={user ? "/setup" : "/login"}
          variant="contained"
        >
          {user ? "Go to setup" : "Login to play"}
        </Button>
      }
      icon={<RouteOutlinedIcon />}
      subtitle="Plan a route through the underground network, execute it step by step, and keep as many coins as possible."
      title="Game Instructions"
    >
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
        }}
      >
        <Stack spacing={2.5}>
          <InfoTile
            icon={<TimerOutlinedIcon />}
            label="Planning time"
            value="90 seconds"
          />
          <InfoTile
            icon={<FlagOutlinedIcon />}
            label="Initial coins"
            value="20 coins"
          />
          <InfoTile
            icon={<EmojiEventsOutlinedIcon />}
            label="Ranking"
            value="Best score per user"
          />
        </Stack>
        <Box>
          <Typography color="text.secondary" sx={{ mb: 1 }} variant="overline">
            Core rules
          </Typography>
          <List dense disablePadding>
            {instructionItems.map((item) => (
              <ListItem
                disableGutters
                key={item}
                sx={{ alignItems: "flex-start", py: 0.75 }}
              >
                <ListItemIcon sx={{ minWidth: 34, pt: 0.5 }}>
                  <Box className="rule-dot" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  slotProps={{
                    primary: {
                      sx: {
                        color: "text.secondary",
                        lineHeight: 1.55,
                      },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </PagePanel>
  );
}
