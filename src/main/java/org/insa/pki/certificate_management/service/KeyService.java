package org.insa.pki.certificate_management.service;

import org.insa.pki.certificate_management.dto.KeyGenerationRequest;
import org.insa.pki.certificate_management.dto.KeyGenerationResponse;

public interface KeyService {
    KeyGenerationResponse generateKey(KeyGenerationRequest request);
}
