package org.insa.pki.certificate_management.service;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.X500NameBuilder;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.pkcs.PKCS10CertificationRequest;
import org.bouncycastle.pkcs.jcajce.JcaPKCS10CertificationRequestBuilder;
import org.insa.pki.certificate_management.dto.CsrRequest;
import org.insa.pki.certificate_management.model.CsrEntity;
import org.insa.pki.certificate_management.model.KeyEntity;
import org.insa.pki.certificate_management.repository.CsrRepository;
import org.insa.pki.certificate_management.repository.KeyRepository;
import org.springframework.stereotype.Service;

import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class CsrService {

    private final KeyRepository keyRepository;
    private final CsrRepository csrRepository;

    public CsrService(KeyRepository keyRepository, CsrRepository csrRepository) {
        this.keyRepository = keyRepository;
        this.csrRepository = csrRepository;
    }

    public String generateAndSaveCsr(CsrRequest request) throws Exception {

        KeyEntity keyEntity = keyRepository.findById(request.getKeyId())
                .orElseThrow(() -> new RuntimeException("Key not found"));


        PrivateKey privateKey = reconstructPrivateKey(keyEntity.getPrivateKey(), keyEntity.getAlgorithm());
        PublicKey publicKey = reconstructPublicKey(keyEntity.getPublicKey(), keyEntity.getAlgorithm());


        X500NameBuilder nameBuilder = new X500NameBuilder(BCStyle.INSTANCE);


        nameBuilder.addRDN(BCStyle.CN, request.getCommonName());


        if (request.getOrganization() != null && !request.getOrganization().isEmpty()) {
            nameBuilder.addRDN(BCStyle.O, request.getOrganization());
        }
        if (request.getCountry() != null && !request.getCountry().isEmpty()) {
            nameBuilder.addRDN(BCStyle.C, request.getCountry());
        }
        if (request.getOrganizationalUnit() != null && !request.getOrganizationalUnit().isEmpty()) {
            nameBuilder.addRDN(BCStyle.OU, request.getOrganizationalUnit());
        }
        if (request.getState() != null && !request.getState().isEmpty()) {
            nameBuilder.addRDN(BCStyle.ST, request.getState());
        }

        X500Name subject = nameBuilder.build();

        JcaPKCS10CertificationRequestBuilder builder = new JcaPKCS10CertificationRequestBuilder(subject, publicKey);

        String sigAlg = keyEntity.getAlgorithm().equalsIgnoreCase("EC") ? "SHA256withECDSA" : "SHA256withRSA";
        ContentSigner signer = new JcaContentSignerBuilder(sigAlg).build(privateKey);
        PKCS10CertificationRequest csr = builder.build(signer);


        String pemCsr = "-----BEGIN CERTIFICATE REQUEST-----\n" +
                Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(csr.getEncoded()) +
                "\n-----END CERTIFICATE REQUEST-----";


        CsrEntity csrEntity = new CsrEntity(
                request.getKeyId(),
                request.getInternalName(),
                request.getCommonName(),
                pemCsr
        );

        csrRepository.save(csrEntity);

        return pemCsr;
    }

    private PrivateKey reconstructPrivateKey(String base64Key, String algorithm) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(base64Key);
        return KeyFactory.getInstance(algorithm).generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    private PublicKey reconstructPublicKey(String base64Key, String algorithm) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(base64Key);
        return KeyFactory.getInstance(algorithm).generatePublic(new X509EncodedKeySpec(decoded));
    }
}