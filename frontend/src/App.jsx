import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RegionalRisk from "./pages/RegionalRisk";
import BuildingRisk from "./pages/BuildingRisk";
import FireMap from "./pages/FireMap";
import Forecast from "./pages/Forecast";
import Simulation from "./pages/Simulation";
import Evacuation from "./pages/Evacuation";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Prediction from "./pages/Prediction";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      {/* Standalone Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main FireGuard AI Command Center */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/regional-risk" element={<RegionalRisk />} />
        <Route path="/building-risk" element={<BuildingRisk />} />
        <Route path="/map" element={<FireMap />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/evacuation" element={<Evacuation />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />

        {/* Backward compatibility */}
        <Route path="/predict" element={<Prediction />} />
        <Route path="/history" element={<History />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
