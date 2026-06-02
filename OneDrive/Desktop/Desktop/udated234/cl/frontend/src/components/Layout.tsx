import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return <>{children}</>;

  const isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN');
  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const isAuditor = user.roles.includes('ROLE_AUDITOR');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Web PKI Platform</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Overview</div>
            <div
              className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </div>
          </div>

          {isSuperAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">System Admin</div>
              <div
                className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}
                onClick={() => navigate('/users')}
              >
                User Directory
              </div>
              <div
                className={`sidebar-link ${isActive('/hsm') ? 'active' : ''}`}
                onClick={() => navigate('/hsm')}
              >
                HSM Slot Monitor
              </div>
              <div
                className={`sidebar-link ${isActive('/publishing-target') ? 'active' : ''}`}
                onClick={() => navigate('/publishing-target')}
              >
                Publishing Targets
              </div>
            </div>
          )}

          {(isAdmin || isSuperAdmin) && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Operations</div>
              {isAdmin && (
                <div
                  className={`sidebar-link ${isActive('/keys') ? 'active' : ''}`}
                  onClick={() => navigate('/keys')}
                >
                  Key Generator
                </div>
              )}
              <div
                className={`sidebar-link ${isActive('/cas') ? 'active' : ''}`}
                onClick={() => navigate('/cas')}
              >
                CA Wizard
              </div>
              {isAdmin && (
                <div
                  className={`sidebar-link ${isActive('/csrs') ? 'active' : ''}`}
                  onClick={() => navigate('/csrs')}
                >
                  CSR Signing Desk
                </div>
              )}
              {isAdmin && (
                <div
                  className={`sidebar-link ${isActive('/revocation') ? 'active' : ''}`}
                  onClick={() => navigate('/revocation')}
                >
                  Revocation Control
                </div>
              )}
            </div>
          )}

          {(isAuditor || isSuperAdmin) && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Security & Logs</div>
              <div
                className={`sidebar-link ${isActive('/audit') ? 'active' : ''}`}
                onClick={() => navigate('/audit')}
              >
                Audit Data Grid
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Self Service</div>
            <div
              className={`sidebar-link ${isActive('/keys') ? 'active' : ''}`}
              onClick={() => navigate('/keys')}
            >
              Key Generator
            </div>
            <div
              className={`sidebar-link ${isActive('/csrs') ? 'active' : ''}`}
              onClick={() => navigate('/csrs')}
            >
              CSR Wizard
            </div>
            <div
              className={`sidebar-link ${isActive('/certificates') ? 'active' : ''}`}
              onClick={() => navigate('/certificates')}
            >
              Certificates List
            </div>
            <div
              className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => navigate('/profile')}
            >
              Profile & MFA
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user.username}</span>
            <span className="sidebar-userrole">
              {user.roles.map((r) => r.replace('ROLE_', '')).join(', ')}
            </span>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="main-header">
          <div className="main-header-title">
            {location.pathname === '/dashboard' && 'Security Dashboard'}
            {location.pathname === '/users' && 'User Administration'}
            {location.pathname === '/hsm' && 'Hardware Security Module Status'}
            {location.pathname === '/publishing-target' && 'Publication Channels'}
            {location.pathname === '/keys' && 'Cryptographic Key Generator'}
            {location.pathname === '/cas' && 'Certificate Authorities Wizard'}
            {location.pathname === '/csrs' && 'CSR Processing Desk'}
            {location.pathname === '/revocation' && 'Revocation Management'}
            {location.pathname === '/audit' && 'System Transaction Audit Trail'}
            {location.pathname === '/certificates' && 'Active Operational Certificates'}
            {location.pathname === '/profile' && 'User Profile & Identity Control'}
          </div>
          <div className="badge badge-info">{user.department || 'PKI Infrastructure'}</div>
        </header>

        <div className="main-content">{children}</div>
      </main>
    </div>
  );
};
