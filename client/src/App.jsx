import { Route, Routes } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppLayout } from "./components/AppLayout.jsx";
import { ProtectedRoute } from "./page/components/ProtectedRoute.jsx";
import { AuthContext } from "./hooks/useAuth.js";
import { useAuthSession } from "./hooks/useAuthSession.js";
import { ExecutionPage } from "./page/ExecutionPage.jsx";
import { InstructionsPage } from "./page/InstructionsPage.jsx";
import { LoginPage } from "./page/LoginPage.jsx";
import { NotFoundPage } from "./page/NotFoundPage.jsx";
import { PlanningPage } from "./page/PlanningPage.jsx";
import { RankingPage } from "./page/RankingPage.jsx";
import { ResultPage } from "./page/ResultPage.jsx";
import { SetupPage } from "./page/SetupPage.jsx";
import { appTheme } from "./theme.js";
import "./App.css";

function App() {
  const auth = useAuthSession();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<InstructionsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="setup" element={<SetupPage />} />
              <Route path="games/:gameId/planning" element={<PlanningPage />} />
              <Route
                path="games/:gameId/execution"
                element={<ExecutionPage />}
              />
              <Route path="games/:gameId/result" element={<ResultPage />} />
              <Route path="ranking" element={<RankingPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
