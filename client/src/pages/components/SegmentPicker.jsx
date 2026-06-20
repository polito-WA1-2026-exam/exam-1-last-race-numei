import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AddRoadOutlinedIcon from "@mui/icons-material/AddRoadOutlined";

export function SegmentPicker({
  disabled,
  onSelectSegment,
  routeError,
  segments = [],
  usedSegmentIds,
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Available segments</Typography>
        <Typography color="text.secondary" variant="body2">
          Select any pair in sequence. Each segment can be used once; the
          server validates continuity and destination after submit.
        </Typography>
      </Box>
      {routeError && <Alert severity="warning">{routeError}</Alert>}
      <List
        dense
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          maxHeight: 390,
          overflow: "auto",
        }}
      >
        {segments.map((segment) => {
          const used = usedSegmentIds.has(segment.id);

          return (
            <ListItem
              divider
              key={segment.id}
              secondaryAction={
                <Button
                  disabled={disabled || used}
                  onClick={() => onSelectSegment(segment)}
                  size="small"
                  startIcon={<AddRoadOutlinedIcon />}
                  variant="outlined"
                >
                  Add
                </Button>
              }
            >
              <ListItemText
                primary={`${segment.stationAName} - ${segment.stationBName}`}
                secondary={used ? (
                  <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                    <Chip color="default" label="Used" size="small" />
                  </Stack>
                ) : null}
                slotProps={{
                  primary: { sx: { fontWeight: 700 } },
                  secondary: { component: "div" },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
