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
  "Setup: logged-in players can inspect the complete underground network with stations, lines, and connections.",
  "Planning: the map hides the connecting lines; only stations, start, destination, and segment pairs are visible.",
  "The route must start at the assigned station, end at the assigned destination, and never reuse a segment.",
  "Line changes are valid only at interchange stations; the server validates the submitted route.",
  "Execution reveals one segment at a time and applies a random event between -4 and +4 coins.",
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
      subtitle="Plan a route through the underground network, execute it before time runs out, and keep as many coins as possible."
      title="Last Race"
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
            icon={<FlagOutlinedIcon />}
            label="Initial balance"
            value="20 coins"
          />
          <InfoTile
            icon={<TimerOutlinedIcon />}
            label="Planning time"
            value="90 seconds"
          />
          <InfoTile
            icon={<EmojiEventsOutlinedIcon />}
            label="Registered players"
            value="Best score ranking"
          />
        </Stack>
        <Box>
          <Typography
            color="text.secondary"
            sx={{ ml: 1.5 }}
            variant="overline"
          >
            Game rules
          </Typography>
          <List dense disablePadding>
            {instructionItems.map((item) => (
              <ListItem
                disableGutters
                key={item}
                sx={{ alignItems: "flex-start", py: 0.75 }}
              >
                <ListItemIcon
                  sx={{ minWidth: 34, pt: 1.5, justifyContent: "center" }}
                >
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
