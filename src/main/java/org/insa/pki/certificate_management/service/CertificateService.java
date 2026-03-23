package org.insa.pki.certificate_management.service;

import org.insa.pki.certificate_management.model.CertificateEntity;
import org.insa.pki.certificate_management.repository.CertificateRepository;
import org.springframework.stereotype.Service;

@Service
public class CertificateService {

    private final CertificateRepository repository;

    // Standard Constructor Injection (Better than @Autowired on field)
    public CertificateService(CertificateRepository repository) {
        this.repository = repository;
    }

    public void importCertificate(String alias, String pemData) {
        // Validation Check: Don't save empty data!
        if (alias == null || alias.trim().isEmpty() || pemData == null || pemData.trim().isEmpty()) {
            throw new IllegalArgumentException("Alias and Certificate content cannot be empty.");
        }

        CertificateEntity entity = new CertificateEntity();
        entity.setAlias(alias);
        entity.setPemContent(pemData);

        repository.save(entity);
    }

    public String exportCertificatePem(Long id) {
        return repository.findById(id)
                .map(CertificateEntity::getPemContent)
                .orElseThrow(() -> new RuntimeException("Certificate with ID " + id + " not found."));
    }
}