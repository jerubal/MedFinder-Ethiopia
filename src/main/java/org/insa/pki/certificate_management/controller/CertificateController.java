package org.insa.pki.certificate_management.controller;

import org.insa.pki.certificate_management.model.CertificateEntity;
import org.insa.pki.certificate_management.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // --- IMPORT & EXPORT ---

    @PostMapping("/import")
    public ResponseEntity<String> importCert(@RequestParam String alias, @RequestBody String pemData) {
        certificateService.importCertificate(alias, pemData);
        return ResponseEntity.ok("Certificate imported successfully.");
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<String> exportCert(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.exportCertificatePem(id));
    }

    // --- NEW LIFECYCLE CONCEPTS ---

    /**
     * CONCEPT 1: SIGNING
     * Uses POST
     */
    @PostMapping("/{id}/sign")
    public ResponseEntity<CertificateEntity> sign(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.signCertificate(id));
    }

    /**
     * CONCEPT 2: RENEWAL
     * Changed to POST to match your Postman preference
     */
    @PostMapping("/{id}/renew")
    public ResponseEntity<CertificateEntity> renew(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.renewCertificate(id));
    }


    @PostMapping("/{id}/revoke")
    public ResponseEntity<String> revoke(@PathVariable Long id) {
        certificateService.revokeCertificate(id);
        return ResponseEntity.ok("Certificate with ID " + id + " has been successfully revoked.");
    }
}