import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface Certificate {
  id: number;
  serialNumber: string;
  alias: string;
  subjectDn: string;
  issuerDn: string;
  status: string;
  notBefore: string;
  notAfter: string;
  ownerId?: number;
  type?: string;
}

interface CaItem {
  id: number;
  alias: string;
  commonName: string;
}

export const Certificates: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [cas, setCas] = useState<CaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importAlias, setImportAlias] = useState('');
  const [importPem, setImportPem] = useState('');
  const [importing, setImporting] = useState(false);

  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedCertForRevoke, setSelectedCertForRevoke] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('0');

  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedCertForRenew, setSelectedCertForRenew] = useState<Certificate | null>(null);
  const [renewYears, setRenewYears] = useState('1');
  const [renewCaKeyId, setRenewCaKeyId] = useState('');
  const [renewing, setRenewing] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCertForDelete, setSelectedCertForDelete] = useState<Certificate | null>(null);

  const isAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isAuditor = user?.roles.includes('ROLE_AUDITOR') || false;
  const canSeeAll = isAdmin || isAuditor;

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const endpoint = (activeTab === 'all' && canSeeAll) ? '/api/certificates' : '/api/certificates/my';
      const response = await api.get(endpoint);
      setCerts(response.data);
    } catch (e: any) {
      showToast('Failed to load certificates inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCas = async () => {
    try {
      const response = await api.get('/api/ca');
      setCas(response.data);
      if (response.data.length > 0) {
        setRenewCaKeyId(response.data[0].id.toString());
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (canSeeAll && activeTab === 'all') {
      setActiveTab('all');
    } else {
      setActiveTab('my');
    }
  }, [user]);

  useEffect(() => {
    fetchCerts();
  }, [activeTab]);

  useEffect(() => {
    fetchCas();
  }, []);

  const handleExport = async (cert: Certificate) => {
    try {
      const response = await api.get(`/api/certificates/${cert.id}/export`);
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${cert.alias}.pem`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`Exported certificate ${cert.alias}`, 'success');
    } catch (e: any) {
      showToast('Failed to export certificate', 'error');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/api/certificates/import', {
        alias: importAlias,
        pem: importPem,
      });
      showToast(`Certificate '${importAlias}' imported successfully`, 'success');
      setImportAlias('');
      setImportPem('');
      setIsImportOpen(false);
      fetchCerts();
    } catch (e: any) {
      showToast(e.response?.data || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const triggerRevocationModal = (cert: Certificate) => {
    setSelectedCertForRevoke(cert);
    setIsRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!selectedCertForRevoke) return;
    try {
      await api.post(`/api/certificates/${selectedCertForRevoke.id}/revoke`, null, {
        params: { reason: parseInt(revocationReason, 10) },
      });
      showToast(`Certificate ${selectedCertForRevoke.alias} revoked`, 'success');
      setIsRevokeOpen(false);
      setSelectedCertForRevoke(null);
      fetchCerts();
    } catch (e: any) {
      showToast('Revocation failed', 'error');
    }
  };

  const triggerRenewModal = (cert: Certificate) => {
    setSelectedCertForRenew(cert);
    setIsRenewOpen(true);
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForRenew) return;
    setRenewing(true);
    try {
      await api.post(`/api/certificates/${selectedCertForRenew.id}/renew`, null, {
        params: {
          years: parseInt(renewYears, 10),
          caKeyId: renewCaKeyId ? parseInt(renewCaKeyId, 10) : null,
        },
      });
      showToast(`Certificate ${selectedCertForRenew.alias} renewed`, 'success');
      setIsRenewOpen(false);
      setSelectedCertForRenew(null);
      fetchCerts();
    } catch (e: any) {
      showToast('Renewal failed', 'error');
    } finally {
      setRenewing(false);
    }
  };

  const triggerDeleteModal = (cert: Certificate) => {
    setSelectedCertForDelete(cert);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCertForDelete) return;
    try {
      await api.delete(`/api/certificates/${selectedCertForDelete.id}`);
      showToast(`Certificate ${selectedCertForDelete.alias} deleted`, 'success');
      setIsDeleteOpen(false);
      setSelectedCertForDelete(null);
      fetchCerts();
    } catch (e: any) {
      showToast('Deletion failed', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-secondary ${activeTab === 'my' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Certificates
          </button>
          {canSeeAll && (
            <button
              className={`btn-secondary ${activeTab === 'all' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Registry Certificates
            </button>
          )}
        </div>
        {!isAuditor && (
          <button className="btn-primary" onClick={() => setIsImportOpen(true)}>
            Import External Certificate
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ height: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : certs.length === 0 ? (
          <div style={{ color: '#64748B', textAlign: 'center', padding: '3rem' }}>
            No active certificates found in this view context.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Serial Number</th>
                  <th>Alias Name</th>
                  <th>Subject DN</th>
                  <th>Issuer DN</th>
                  <th>Status</th>
                  <th>Validity Dates</th>
                  {!isAuditor && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td className="monospace-cell" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.serialNumber || 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{c.alias}</span>
                        {c.type === 'HSM' && <span className="badge-hardware">HSM Secure</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.subjectDn}
                    </td>
                    <td style={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.issuerDn}
                    </td>
                    <td>
                      {c.status === 'REVOKED' ? (
                        <span className="badge badge-danger">Revoked</span>
                      ) : c.status === 'EXPIRED' ? (
                        <span className="badge badge-warning">Expired</span>
                      ) : (
                        <span className="badge badge-success">Active / Valid</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      Start: {c.notBefore ? c.notBefore.split('T')[0] : 'N/A'}<br />
                      End: {c.notAfter ? c.notAfter.split('T')[0] : 'N/A'}
                    </td>
                    {!isAuditor && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleExport(c)}>
                            Export
                          </button>
                          {c.status !== 'REVOKED' && (
                            <>
                              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRenewModal(c)}>
                                Renew
                              </button>
                              <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRevocationModal(c)}>
                                Revoke
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#DC2626' }} onClick={() => triggerDeleteModal(c)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isImportOpen && (
        <div className="modal-overlay" onClick={() => setIsImportOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Import External Public Certificate</h3>
              <button className="toast-close" onClick={() => setIsImportOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Keystore Alias Label</label>
                  <input
                    type="text"
                    value={importAlias}
                    onChange={(e) => setImportAlias(e.target.value)}
                    placeholder="e.g., external-partner-cert"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Raw Certificate Data (PEM Format)</label>
                  <textarea
                    value={importPem}
                    onChange={(e) => setImportPem(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----\nMIIF..."
                    style={{ height: '200px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsImportOpen(false)}>
                  Abort
                </button>
                <button type="submit" className="btn-primary" disabled={importing}>
                  {importing ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Import Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRenewOpen && (
        <div className="modal-overlay" onClick={() => setIsRenewOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Renew Certificate Validity</h3>
              <button className="toast-close" onClick={() => setIsRenewOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRenew}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Extending the operational validity dates for alias <strong>{selectedCertForRenew?.alias}</strong>.
                </p>
                <div className="form-group">
                  <label>Signing CA Authority</label>
                  <select value={renewCaKeyId} onChange={(e) => setRenewCaKeyId(e.target.value)}>
                    <option value="">-- Defaults (Original CA) --</option>
                    {cas.map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.alias} ({ca.commonName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Additional Validity Duration (Years)</label>
                  <select value={renewYears} onChange={(e) => setRenewYears(e.target.value)}>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsRenewOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={renewing}>
                  {renewing ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Execute Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={isRevokeOpen}
        title="Revoke Public Certificate"
        body={
          <div>
            <p style={{ marginBottom: '1rem' }}>
              Are you sure you want to revoke certificate <strong>{selectedCertForRevoke?.alias}</strong>? This will permanently publish this serial number to the CRL.
            </p>
            <div className="form-group">
              <label>Reason Code (RFC 5280)</label>
              <select value={revocationReason} onChange={(e) => setRevocationReason(e.target.value)}>
                <option value="0">Unspecified (0)</option>
                <option value="1">Key Compromise (1)</option>
                <option value="2">CA Compromise (2)</option>
                <option value="3">Affiliation Changed (3)</option>
                <option value="4">Superseded (4)</option>
                <option value="5">Cessation of Operation (5)</option>
                <option value="6">Certificate Hold (6)</option>
              </select>
            </div>
          </div>
        }
        confirmText="Revoke Certificate"
        cancelText="Abort"
        onClose={() => setIsRevokeOpen(false)}
        onConfirm={handleRevoke}
        confirmValidationText={selectedCertForRevoke?.alias}
      />

      <Modal
        isOpen={isDeleteOpen}
        title="Confirm Certificate Deletion"
        body={
          <p>
            Are you sure you want to permanently delete certificate <strong>{selectedCertForDelete?.alias}</strong>? This action cannot be undone.
          </p>
        }
        confirmText="Delete Certificate"
        cancelText="Abort"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmValidationText={selectedCertForDelete?.alias}
      />
    </div>
  );
};
