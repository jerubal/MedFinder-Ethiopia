package org.insa.pki.certificate_management.controller;

import org.insa.pki.certificate_management.dto.CertificateImportRequest;
import org.insa.pki.certificate_management.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certService;

    public CertificateController(CertificateService certService) {
        this.certService = certService;
    }
    // for import
    @PostMapping("/import")
    public ResponseEntity<String> importCert(@RequestBody CertificateImportRequest request) {
        try {

            certService.importCertificate(request.getAlias(), request.getPem());
            return ResponseEntity.ok("Certificate imported successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Import failed: " + e.getMessage());
        }
    }
    //For Export
    @GetMapping("/export/{id}")
    public ResponseEntity<String> exportCert(@PathVariable Long id) {
        try {
            String pem = certService.exportCertificatePem(id);
            return ResponseEntity.ok(pem);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}