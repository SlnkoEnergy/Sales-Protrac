import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/modules/dashboard/pages/Dashboard";
import Leads from "@/modules/leads/pages/Leads";
import LoginPage from "@/modules/auth/pages/Login_Page";
import LeadProfile from "@/modules/leads/pages/LeadProfile";
import Tasks from "@/modules/task/pages/TaskDashboard";
import AddTasks from "@/modules/task/pages/AddTask";
import ViewTasks from "@/modules/task/pages/ViewTask";
import AddLead from "@/modules/leads/pages/AddLead";
import EditLead from "@/modules/leads/pages/EditLead";
import Meetings from "@/modules/meeting/pages/MeetingDashboard";
import PrivateRoute from "./utils/PrivateRoutes";
import { Toaster } from "@/components/ui/sonner";
import { DateFilterProvider } from "./modules/dashboard/components/DateFilterContext";
import Layout from "./components/layout/Layout";
import DocumentViewer from "./components/lead/DocumentViewer";
import Handover from "./modules/team/pages/HandoverDashboard";
import Group from "./modules/group/pages/AddGroup";
import Groups from "./modules/group/pages/Groups";
import GroupDetail from "./modules/group/pages/GroupDetail";
import NotFound from "./modules/not found/NotFound";
import SearchParamSyncer from "./SearchParamsSync";
import ParentSearchSyncer from "./ParentSearchParamsSyncer";

function App() {
  return (
    <DateFilterProvider>
      <Router>
        <SearchParamSyncer />
        <ParentSearchSyncer />
         
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="group" element={<Groups />} />
            <Route path="groupDetail" element={<GroupDetail />} />
            <Route path="leads" element={<Leads />} />
            <Route path="document-viewer" element={<DocumentViewer />} />
            <Route path="leadProfile" element={<LeadProfile />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="addtask" element={<AddTasks />} />
            <Route path="viewtask" element={<ViewTasks />} />
            <Route path="addlead" element={<AddLead />} />
            <Route path="editlead" element={<EditLead />} />
            <Route path="meeting" element={<Meetings />} />
            <Route path="handover" element={<Handover />} />
            <Route path="addgroup" element={<Group />} />
          </Route>
        </Routes>
      </Router>
      <Toaster richColors position="top-center" />
    </DateFilterProvider>
  );
}

export default App;
