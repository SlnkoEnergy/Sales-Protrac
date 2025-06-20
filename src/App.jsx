// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from '../src/modules/dashboard/pages/Dashboard'
import Leads from "../src/modules/leads/pages/leads";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
      </Routes>
    </Router>
  );
}

export default App;