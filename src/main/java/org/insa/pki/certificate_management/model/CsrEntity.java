package org.insa.pki.certificate_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "generated_csrs")
public class CsrEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long keyId;

    @Column(name = "internal_name")
    private String internalName;

    @Column(nullable = false)
    private String commonName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String csrPem;

    public CsrEntity() {}

    public CsrEntity(Long keyId, String internalName, String  commonName, String csrPem) {
        this.keyId = keyId;
        this.internalName = internalName;
        this.commonName = commonName;
        this.csrPem = csrPem;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }


    public String getInternalName() {
        return internalName;
    }

    public void setInternalName(String internalName) {
        this.internalName = internalName;
    }

    public Long getKeyId() { return keyId; }
    public void setKeyId(Long keyId) { this.keyId = keyId; }

    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }

    public String getCsrPem() { return csrPem; }
    public void setCsrPem(String csrPem) { this.csrPem = csrPem; }
}