import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CreateJob from "./pages/CreateJob";
import UploadResumes from "./pages/UploadResumes";
import CandidateDashboard from "./pages/CandidateDashboard";
import JobsList from "./pages/JobsList";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/jobs" element={<AppShell><JobsList /></AppShell>} />
        <Route path="/create-job" element={<AppShell><CreateJob /></AppShell>} />
        <Route path="/jobs/:jobId/upload" element={<AppShell><UploadResumes /></AppShell>} />
        <Route path="/jobs/:jobId/candidates" element={<AppShell><CandidateDashboard /></AppShell>} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h2 className="logo">HireMind AI</h2>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

export default App;