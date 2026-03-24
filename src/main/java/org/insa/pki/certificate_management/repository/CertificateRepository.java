package org.insa.pki.certificate_management.repository;

import org.insa.pki.certificate_management.model.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, Long> {

}