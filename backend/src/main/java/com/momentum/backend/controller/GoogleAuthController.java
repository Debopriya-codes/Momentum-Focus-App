package com.momentum.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.AuthDto;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.security.JwtUtils;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

/**
 * Google OAuth2 controller.
 *
 * Flow:
 *   1. Frontend uses Google Identity Services (GSI) to get an ID Token credential.
 *   2. Frontend POSTs { "credential": "<id_token>" } to /api/auth/google.
 *   3. We verify the token by calling Google's tokeninfo endpoint.
 *   4. On success, we upsert the user and return our own JWT.
 *
 * Why tokeninfo?  It requires NO extra libraries and works perfectly for server apps.
 * The only trade-off vs. a local verification library is one extra HTTP round-trip,
 * which is fine for an auth flow that happens once per session.
 */
@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthController.class);
    private static final String GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtils jwtUtils;

    @Value("${google.client.id}")
    private String googleClientId;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    // ──────────────────────────────────────────────────────────────────────────
    //  POST /api/auth/google
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody AuthDto.GoogleAuthRequest req) {

        // 1. Verify the credential with Google
        JsonNode payload;
        try {
            payload = verifyGoogleToken(req.getCredential());
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Google credential: " + e.getMessage());
        }

        // 2. Extract claims
        String googleSub = payload.path("sub").asText(null);     // unique Google user ID
        String email     = payload.path("email").asText(null);
        String name      = payload.path("name").asText(null);
        String picture   = payload.path("picture").asText(null);
        String audClaim  = payload.path("aud").asText("");

        if (googleSub == null || email == null) {
            return ResponseEntity.badRequest().body("Google token is missing required fields.");
        }

        // 3. (Optional but recommended) Check the audience matches YOUR client ID.
        //    This prevents tokens issued for other apps being accepted.
        if (!googleClientId.isBlank() && !audClaim.equals(googleClientId)) {
            log.warn("Google token audience mismatch. Expected: {} Got: {}", googleClientId, audClaim);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token audience does not match this application.");
        }

        // 4. Upsert the user ── find by googleId first, then by email
        User user = userRepository.findByGoogleId(googleSub).orElseGet(() ->
                userRepository.findByEmail(email).orElse(null)
        );

        if (user == null) {
            // Brand-new Google user → create account
            String username = deriveUsername(name, email);
            user = User.builder()
                    .email(email)
                    .username(username)
                    .password(null)           // no local password for OAuth users
                    .provider("GOOGLE")
                    .googleId(googleSub)
                    .avatarUrl(picture)
                    .build();
        } else {
            // Existing user → keep their data fresh
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleSub);
                user.setProvider("GOOGLE");
            }
            if (picture != null) {
                user.setAvatarUrl(picture);
            }
        }

        userRepository.save(user);

        // 5. Issue our own JWT so the rest of the API works normally
        String token = jwtUtils.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthDto.AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getProvider()
        ));
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private JsonNode verifyGoogleToken(String idToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GOOGLE_TOKENINFO + idToken))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Google returned HTTP " + response.statusCode() +
                    ": " + response.body());
        }

        JsonNode node = mapper.readTree(response.body());

        // tokeninfo returns "error_description" if the token is invalid
        if (node.has("error_description")) {
            throw new RuntimeException(node.path("error_description").asText());
        }

        return node;
    }

    /**
     * Builds a clean, unique username from the Google display-name or email.
     * e.g.  "Debopriya Roy"  ->  "debopriyaroy"  (then appends digits if taken)
     */
    private String deriveUsername(String name, String email) {
        String base = name != null
                ? name.toLowerCase().replaceAll("[^a-z0-9]", "")
                : email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");

        if (base.isBlank()) base = "user";

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }
}
