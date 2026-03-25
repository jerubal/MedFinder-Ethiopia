package org.insa.pki.certificate_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class CertificateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alias;

    @Column(columnDefinition = "TEXT")
    private String pemContent;

    // --- ADD THESE FIELDS FOR LIFECYCLE MANAGEMENT ---

    @Column(nullable = false)
    private String status = "ISSUED"; // Concepts: ISSUED, SIGNED, REVOKED

    private LocalDateTime issuedAt;    // Concept 1: Signing Date

    private LocalDateTime expiryDate;  // Concept 2: Renewal Target

    private LocalDateTime revokedAt;   // Concept 3: Revocation Timestamp

    // ------------------------------------------------

    public CertificateEntity() {}

    // Existing Getters/Setters
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getPemContent() { return pemContent; }
    public void setPemContent(String pemContent) { this.pemContent = pemContent; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // --- NEW GETTERS AND SETTERS ---

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public LocalDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(LocalDateTime revokedAt) { this.revokedAt = revokedAt; }
}