import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/modules/dashboard/pages/Dashboard";
import Leads from "@/modules/leads/pages/leads";
import LoginPage from "@/modules/Login/pages/login_page";
import LeadProfile from "@/modules/leads/pages/leadProfile";
import Tasks from "@/modules/task/pages/TaskDashboard"
import AddTask from "@/components/task/AddTask"
import ViewTask from "@/components/task/ViewTask"
import PrivateRoute from "../utils/PrivateRoutes";
import Layout from "../src/components/layout/Layout";
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
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leadProfile" element={<LeadProfile />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="addtask" element={<AddTask />} />
            <Route path="viewtask" element={<ViewTask />} />
          </Route>
        </Routes>
      </Router>

      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
