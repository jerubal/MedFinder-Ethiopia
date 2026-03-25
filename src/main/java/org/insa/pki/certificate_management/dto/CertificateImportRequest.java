package org.insa.pki.certificate_management.dto;

public class CertificateImportRequest {
    private String alias;
    private String pem;

    public CertificateImportRequest() {}

    public void setAlias(String alias) { this.alias= alias; }
    public void setPem(String pem) { this.pem = pem; }


    public String getAlias() { return alias; }
    public String getPem() { return pem; }

}
