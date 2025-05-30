import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Layout from './components/Layout/Layout';

// Main pages
import Dashboard from './pages/Dashboard/Dashboard';
import Meetings from './pages/Meetings/Meetings';
import MeetingDetails from './pages/Meetings/MeetingDetails';
import AgendaGenerator from './pages/Tools/AgendaGenerator';
import MeetingSummaries from './pages/Summaries/MeetingSummaries';
import SummaryDetails from './pages/Summaries/SummaryDetails';
import Settings from './pages/Settings/Settings';

// Auth components
import AuthCallback from './pages/Auth/AuthCallback';

// Demo showcase (now the main landing page)
import DemoShowcase from './components/Demo/DemoShowcase';

function App() {
  return (
    <Routes>
      {/* Landing page - Modern demo showcase */}
      <Route path="/" element={<DemoShowcase />} />
      <Route path="/demo" element={<DemoShowcase />} />
      
      {/* Auth callback route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Dashboard routes - accessible via landing page */}
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/:id" element={<MeetingDetails />} />
        <Route path="tools/agenda-generator" element={<AgendaGenerator />} />
        <Route path="summaries" element={<MeetingSummaries />} />
        <Route path="summaries/:id" element={<SummaryDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
