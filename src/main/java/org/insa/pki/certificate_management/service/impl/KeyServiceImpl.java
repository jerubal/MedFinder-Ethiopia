package org.insa.pki.certificate_management.service.impl;

import org.insa.pki.certificate_management.dto.KeyGenerationRequest;
import org.insa.pki.certificate_management.dto.KeyGenerationResponse;
import org.insa.pki.certificate_management.model.KeyEntity;
import org.insa.pki.certificate_management.repository.KeyRepository;
import org.insa.pki.certificate_management.service.KeyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;

@Service
public class KeyServiceImpl implements KeyService {

    private final KeyRepository keyRepository;

    public KeyServiceImpl(KeyRepository keyRepository) {
        this.keyRepository = keyRepository;
    }

    @Override
    @Transactional
    public KeyGenerationResponse generateKey(KeyGenerationRequest request) {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance(request.getAlgorithm());

            if (request.getAlgorithm().equalsIgnoreCase("EC")) {
                keyGen.initialize(new ECGenParameterSpec(request.getKeySize()));
            } else {

                int bitSize = Integer.parseInt(request.getKeySize());
                keyGen.initialize(bitSize);
            }

            KeyPair keyPair = keyGen.generateKeyPair();

            String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());

            KeyEntity entity = new KeyEntity();
            entity.setAlgorithm(request.getAlgorithm());
            entity.setPublicKey(publicKey);
            entity.setPrivateKey(privateKey);
            keyRepository.save(entity);

            return new KeyGenerationResponse(publicKey, privateKey);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Key Generation failed for " + request.getAlgorithm() + ": " + e.getMessage());
        }
    }}