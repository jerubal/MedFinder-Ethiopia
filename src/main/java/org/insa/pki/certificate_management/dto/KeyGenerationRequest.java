package org.insa.pki.certificate_management.dto;

public class KeyGenerationRequest {
    private String algorithm; // RSA, DSA, EC
    private String keySize;   // "2048", "1024", or "secp256r1"

    public KeyGenerationRequest() {}

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public String getKeySize() { return keySize; }
    public void setKeySize(String keySize) { this.keySize = keySize; }
}




