import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoModeProvider } from './context/DemoModeContext';
import Landing from './pages/Landing';
import VaultDashboard from './pages/VaultDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Certificate from './pages/Certificate';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DemoModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/vault" element={<VaultDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </DemoModeProvider>
  );
}
