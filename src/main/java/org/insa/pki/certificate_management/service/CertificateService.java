package org.insa.pki.certificate_management.service;

import org.insa.pki.certificate_management.model.CertificateEntity;
import org.insa.pki.certificate_management.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class CertificateService {

    private final CertificateRepository repository;

    public CertificateService(CertificateRepository repository) {
        this.repository = repository;
    }

    // --- YOUR EXISTING METHODS ---

    public void importCertificate(String alias, String pemData) {
        if (alias == null || alias.trim().isEmpty() || pemData == null || pemData.trim().isEmpty()) {
            throw new IllegalArgumentException("Alias and Certificate content cannot be empty.");
        }
        CertificateEntity entity = new CertificateEntity();
        entity.setAlias(alias);
        entity.setPemContent(pemData);
        entity.setStatus("ISSUED"); // Initial status
        repository.save(entity);
    }

    public String exportCertificatePem(Long id) {
        return repository.findById(id)
                .map(CertificateEntity::getPemContent)
                .orElseThrow(() -> new RuntimeException("Certificate with ID " + id + " not found."));
    }

    // --- NEW CONCEPTS TO ADD ---

    /**
     * 1. SIGNING
     * In a real PKI, this would use a Private Key to sign.
     * Here, we update the status and set the validity period.
     */
    public CertificateEntity signCertificate(Long id) {
        CertificateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cert not found"));

        entity.setStatus("SIGNED");
        entity.setExpiryDate(LocalDateTime.now().plusYears(1));
        return repository.save(entity);
    }

    /**
     * 2. RENEWAL
     * Extends the expiry date. Usually only allowed if not revoked.
     */
    public CertificateEntity renewCertificate(Long id) {
        CertificateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cert not found"));

        if ("REVOKED".equals(entity.getStatus())) {
            throw new IllegalStateException("Cannot renew a revoked certificate.");
        }

        entity.setExpiryDate(entity.getExpiryDate().plusYears(1));
        entity.setStatus("RENEWED");
        return repository.save(entity);
    }

    /**
     * 3. REVOCATION
     * Marks the certificate as invalid immediately.
     */
    public void revokeCertificate(Long id) {
        CertificateEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cert not found"));

        entity.setStatus("REVOKED");
        entity.setRevokedAt(LocalDateTime.now());
        repository.save(entity);
    }
}