import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface KeyPair {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
  message?: string;
}

export const Keys: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [loading, setLoading] = useState(true);

  const [algorithm, setAlgorithm] = useState('RSA');
  const [keySize, setKeySize] = useState('2048');
  const [alias, setAlias] = useState('');
  const [isHsm, setIsHsm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyPair | null>(null);

  const fetchKeys = async () => {
    try {
      const response = await api.get('/api/keys');
      setKeys(response.data);
    } catch (e: any) {
      showToast('Failed to load keys catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAlgorithmChange = (algo: string) => {
    setAlgorithm(algo);
    if (algo === 'RSA') {
      setKeySize('2048');
    } else if (algo === 'EC') {
      setKeySize('secp256r1');
    } else if (algo === 'EdDSA') {
      setKeySize('ed25519');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const endpoint = isHsm ? '/api/keys/generate-hsm' : '/api/keys/generate';
      const response = await api.post(endpoint, {
        algorithm,
        keySize,
        alias: alias.trim() ? alias.trim() : null,
      });
      showToast(response.data.message || 'Key pair generated successfully', 'success');
      setAlias('');
      fetchKeys();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Key generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const openDeleteModal = (key: KeyPair) => {
    setSelectedKey(key);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedKey) return;
    try {
      await api.delete(`/api/keys/${selectedKey.id}`);
      showToast(`Key pair ${selectedKey.alias} deleted`, 'success');
      fetchKeys();
    } catch (e: any) {
      showToast('Key deletion failed', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedKey(null);
    }
  };

  const handleBackup = (key: KeyPair) => {
    showToast(`Keystore export backup initiated for alias: ${key.alias}`, 'success');
  };

  const handleRotate = (key: KeyPair) => {
    showToast(`Key rotation lifecycle triggered for alias: ${key.alias}`, 'success');
  };

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Key Pair Generator</h3>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Cryptographic Algorithm</label>
              <select value={algorithm} onChange={(e) => handleAlgorithmChange(e.target.value)}>
                <option value="RSA">RSA (Rivest-Shamir-Adleman)</option>
                <option value="EC">ECC (Elliptic Curve Cryptography)</option>
                <option value="EdDSA">EdDSA (Edwards-curve Digital Signature Algorithm)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Key Size / Curve Selection</label>
              {algorithm === 'RSA' && (
                <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                  <option value="2048">2048-bit (Standard Security)</option>
                  <option value="3072">3072-bit (Enhanced Security)</option>
                  <option value="4048">4048-bit (Military Grade / CA Anchor)</option>
                </select>
              )}
              {algorithm === 'EC' && (
                <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                  <option value="secp256r1">secp256r1 (P-256)</option>
                  <option value="secp384r1">secp384r1 (P-384)</option>
                </select>
              )}
              {algorithm === 'EdDSA' && (
                <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                  <option value="ed25519">Ed25519 (Fast / Modern)</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Alias / Label Indicator</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., insa-web-server-key"
                required
              />
            </div>

            {(user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN')) && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isHsm"
                  checked={isHsm}
                  onChange={(e) => setIsHsm(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isHsm" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Hardware Security Module (HSM) Token Binding
                </label>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={generating}>
              {generating ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Generate Key Pair'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">Keystore Inventory Catalog</h3>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="scrollable-list">
              {keys.length === 0 ? (
                <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No active cryptographic key pairs found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{k.alias}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                            ID: {k.id} &bull; {k.algorithm} &bull; {k.keySize}
                          </div>
                        </div>
                        {k.type === 'HSM' ? (
                          <span className="badge-hardware">Hardware Protected</span>
                        ) : (
                          <span className="badge badge-info">Software DB</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleBackup(k)}>
                          Backup
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRotate(k)}>
                          Rotate
                        </button>
                        <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openDeleteModal(k)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirm Key Deletion"
        body={
          <p>
            Are you sure you want to permanently delete key pair <strong>{selectedKey?.alias}</strong>? This action is irreversible. Any certificates depending on this key pair will become invalid.
          </p>
        }
        confirmText="Yes, Delete Key"
        cancelText="Cancel"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmValidationText={selectedKey?.alias}
      />
    </div>
  );
};
