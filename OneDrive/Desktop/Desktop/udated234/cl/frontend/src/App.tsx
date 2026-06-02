import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RbacGuard } from './components/RbacGuard';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Hsm } from './pages/Hsm';
import { Keys } from './pages/Keys';
import { CAs } from './pages/CAs';
import { Csrs } from './pages/Csrs';
import { Certificates } from './pages/Certificates';
import { Revocation } from './pages/Revocation';
import { PublishingTarget } from './pages/PublishingTarget';
import { Audit } from './pages/Audit';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/dashboard"
              element={
                <RbacGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/users"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <Users />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/hsm"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <Hsm />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/publishing-target"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <PublishingTarget />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/keys"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_USER']}>
                  <Layout>
                    <Keys />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/cas"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <CAs />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/csrs"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_USER']}>
                  <Layout>
                    <Csrs />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/revocation"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN']}>
                  <Layout>
                    <Revocation />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/audit"
              element={
                <RbacGuard allowedRoles={['ROLE_AUDITOR', 'ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <Audit />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/certificates"
              element={
                <RbacGuard>
                  <Layout>
                    <Certificates />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/profile"
              element={
                <RbacGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default App;
