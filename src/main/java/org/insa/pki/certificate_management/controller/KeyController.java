package org.insa.pki.certificate_management.controller;

import org.insa.pki.certificate_management.dto.KeyGenerationRequest;
import org.insa.pki.certificate_management.dto.KeyGenerationResponse;
import org.insa.pki.certificate_management.service.KeyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/keys")
public class KeyController {

    private final KeyService keyService;

    public KeyController(KeyService keyService) {
        this.keyService = keyService;
    }

    @PostMapping("/generate")
    public KeyGenerationResponse generateKey(@RequestBody KeyGenerationRequest request) {
        return keyService.generateKey(request);
    }
}
