import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/DemoModeContext';
import { ScrollToTop } from './components/ScrollToTop';
import { DemoBar } from './components/DemoBar';
import ErrorBoundary from './components/ErrorBoundary';
import { PageWrapper } from './components/PageWrapper';
import { Loader2 } from 'lucide-react';

const Landing = lazy(() => import('./pages/Landing'));
const VaultDashboard = lazy(() => import('./pages/VaultDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const Certificate = lazy(() => import('./pages/Certificate'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen bg-navy flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-blueAccent animate-spin" />
      <span className="font-mono text-white/40 text-xs uppercase tracking-widest">
        Loading...
      </span>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <DemoBar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/vault" element={<PageWrapper><VaultDashboard /></PageWrapper>} />
              <Route path="/manager" element={<PageWrapper><ManagerDashboard /></PageWrapper>} />
              <Route path="/certificate" element={<PageWrapper><Certificate /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
              <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
