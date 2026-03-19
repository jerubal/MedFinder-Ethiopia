package org.insa.pki.certificate_management.dto;

public class KeyGenerationRequest {

    private String algorithm; // RSA, ECC (for now use RSA)
    private int keySize; // 2048, 4096

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public int getKeySize() {
        return keySize;
    }

    public void setKeySize(int keySize) {
        this.keySize = keySize;
    }
}
