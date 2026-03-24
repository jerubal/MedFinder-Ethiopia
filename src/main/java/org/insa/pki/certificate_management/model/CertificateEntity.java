package org.insa.pki.certificate_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "certificates")
public class CertificateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alias;

    @Column(columnDefinition = "TEXT")
    private String pemContent;

    public CertificateEntity() {}

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public void setPemContent(String pemContent) {
        this.pemContent = pemContent;
    }

    public String getAlias() {
        return alias;
    }

    public String getPemContent() {
        return pemContent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}