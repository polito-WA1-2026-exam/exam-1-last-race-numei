import { Navigate } from "react-router";
import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { PagePanel } from "./components/PagePanel.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useLoginForm } from "./hooks/useLoginForm.js";

export function LoginPage() {
  const { user } = useAuth();
  const { credentials, error, handleChange, handleSubmit, submitting } =
    useLoginForm();

  if (user) return <Navigate to="/setup" replace />;

  return (
    <PagePanel
      // icon={<LoginOutlinedIcon />}
      subtitle="Registered users can play games and appear in the ranking. Anonymous visitors can only read the instructions."
      title="Login"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2, maxWidth: 420 }}
      >
        <TextField
          autoComplete="username"
          label="Username"
          onChange={handleChange("username")}
          required
          value={credentials.username}
        />
        <TextField
          autoComplete="current-password"
          label="Password"
          onChange={handleChange("password")}
          required
          type="password"
          value={credentials.password}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          disabled={submitting}
          size="large"
          startIcon={
            submitting ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <LoginOutlinedIcon />
            )
          }
          type="submit"
          variant="contained"
        >
          Login
        </Button>
      </Box>
    </PagePanel>
  );
}
