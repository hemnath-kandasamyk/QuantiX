import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';

import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Billing } from './pages/Billing';
import { SalesHistory } from './pages/SalesHistory';
import { Alerts } from './pages/Alerts';
import { AIAssistant } from './pages/AIAssistant';
import { Staff } from './pages/Staff';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>

              {/* Home Page */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Other Pages */}
              <Route path="/products" element={<Products />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/sales" element={<SalesHistory />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/staff" element={<Staff />} />

              {/* Redirect Unknown Routes */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
