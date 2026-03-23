package org.insa.pki.certificate_management.dto;

public class CsrRequest {
    private Long keyId;
    public String internalName;
    private String commonName;
    private String organization;
    private String organizationalUnit;
    private String country;
    private String state;

    public CsrRequest() {}


    public Long getKeyId() { return keyId; }
    public void setKeyId(Long keyId) { this.keyId = keyId; }
    public String getInternalName() { return internalName; }
    public void setInternalName(String internalName) { this.internalName = internalName; }


    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getOrganizationalUnit() { return organizationalUnit; }
    public void setOrganizationalUnit(String organizationalUnit) { this.organizationalUnit = organizationalUnit; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

}
