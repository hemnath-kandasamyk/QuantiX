import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
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
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Shop Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Billing />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AIAssistant />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Staff />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
