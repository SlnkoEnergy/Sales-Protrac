import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../src/modules/dashboard/pages/Dashboard";
import Leads from "../src/modules/leads/pages/leads";
import LoginPage from "../src/modules/Login/pages/login_page";
import LeadProfile from "../src/modules/leads/pages/leadProfile"
import PrivateRoute from "../utils/PrivateRoutes";
import { Toaster } from "@/components/ui/sonner"; 

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            }
          />
           <Route
            path="/leadProfile"
            element={
              <PrivateRoute>
                <LeadProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
