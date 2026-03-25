package org.insa.pki.certificate_management.controller;

import org.insa.pki.certificate_management.dto.CaRequest;
import org.insa.pki.certificate_management.service.CaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ca")
public class CaController {

    private final CaService caService;

    public CaController(CaService caService) {
        this.caService = caService;
    }

    @PostMapping("/root")
    public ResponseEntity<String> createRoot(@RequestBody CaRequest request) {
        try {
            return ResponseEntity.ok(caService.createRootCa(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/intermediate")
    public ResponseEntity<String> createIntermediate(@RequestBody CaRequest request) {
        try {
            return ResponseEntity.ok(caService.createIntermediateCa(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}