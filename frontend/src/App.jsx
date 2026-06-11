import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Offres from "./pages/Offres";
import Candidatures from "./pages/Candidatures";
import PageSimple from "./pages/PageSimple";
import ProtectedRoute from "./routes/ProtectedRoute";
import SelectionIA from "./pages/SelectionIA";
import Employes from "./pages/Employes";
import Contrats from "./pages/Contrats";
import Missions from "./pages/Missions";
import Paiements from "./pages/Paiements";
import Attestations from "./pages/Attestations";
import Evaluations from "./pages/Evaluations";
import Rapports from "./pages/Rapports";
import Parametres from "./pages/Parametres";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offres"
          element={
            <ProtectedRoute>
              <Offres />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidatures"
          element={
            <ProtectedRoute>
              <Candidatures />
            </ProtectedRoute>
          }
        />

        <Route
          path="/selection"
          element={
            <ProtectedRoute>
              <SelectionIA />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contrats"
          element={
            <ProtectedRoute>
              <Contrats />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <Missions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paiements"
          element={
            <ProtectedRoute>
              <Paiements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employes"
          element={
            <ProtectedRoute>
              <Employes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evaluations"
          element={
            <ProtectedRoute>
              <Evaluations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attestations"
          element={
            <ProtectedRoute>
              <Attestations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rapports"
          element={
            <ProtectedRoute>
              <Rapports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parametres"
          element={
            <ProtectedRoute>
              <Parametres />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;