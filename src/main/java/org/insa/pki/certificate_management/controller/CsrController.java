package org.insa.pki.certificate_management.controller;

import org.insa.pki.certificate_management.dto.CsrRequest;
import org.insa.pki.certificate_management.service.CsrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/csr")
public class CsrController {

    private final CsrService csrService;

    public CsrController(CsrService csrService) {
        this.csrService = csrService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateCsr(@RequestBody CsrRequest request) {

        if (request.getInternalName() == null || request.getInternalName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Internal Name is required.");
        }

        try {

            String pemCsr = csrService.generateAndSaveCsr(request);
            return ResponseEntity.ok(pemCsr);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("CSR Generation Failed: " + e.getMessage());
        }
    }
}