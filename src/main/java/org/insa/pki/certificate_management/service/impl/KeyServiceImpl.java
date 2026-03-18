package org.insa.pki.certificate_management.service.impl;

import org.insa.pki.certificate_management.dto.KeyGenerationRequest;
import org.insa.pki.certificate_management.dto.KeyGenerationResponse;
import org.insa.pki.certificate_management.service.KeyService;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

@Service
public class KeyServiceImpl implements KeyService {

    @Override
    public KeyGenerationResponse generateKey(KeyGenerationRequest request) {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance(request.getAlgorithm());
            keyGen.initialize(request.getKeySize());

            KeyPair keyPair = keyGen.generateKeyPair();

            String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());

            return new KeyGenerationResponse(publicKey, privateKey);

        } catch (Exception e) {
            throw new RuntimeException("Error generating key", e);
        }
    }
}