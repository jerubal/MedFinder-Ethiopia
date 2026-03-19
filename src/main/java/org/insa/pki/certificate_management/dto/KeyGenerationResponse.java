package org.insa.pki.certificate_management.dto;

public class KeyGenerationResponse {
    private final String publicKey;
    private final String privateKey;


    public KeyGenerationResponse(String publicKey, String privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    public String getPublicKey() {

        return publicKey;
    }

    public String getPrivateKey()
    {
        return privateKey;
    }
}