package org.insa.pki.certificate_management.dto;

public class CaRequest {
    private Long keyId;           // The ID of the key pair to use
    private String commonName;    // e.g., "My Root CA"
    private String issuerAlias;   // Null for Root; the alias of the Root for Intermediate
    private Integer validityYears; // How long the CA is valid (e.g., 10 for Root, 5 for Inter)

    public CaRequest() {}

    // Getters and Setters
    public Long getKeyId() { return keyId; }
    public void setKeyId(Long keyId) { this.keyId = keyId; }
    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }
    public String getIssuerAlias() { return issuerAlias; }
    public void setIssuerAlias(String issuerAlias) { this.issuerAlias = issuerAlias; }
    public Integer getValidityYears() { return validityYears; }
    public void setValidityYears(Integer validityYears) { this.validityYears = validityYears; }
}