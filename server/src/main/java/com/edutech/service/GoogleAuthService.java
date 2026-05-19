package com.edutech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.logging.Logger;

@Service
public class GoogleAuthService {

    private static final Logger log = Logger.getLogger(GoogleAuthService.class.getName());
    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleUserInfo verifyToken(String idToken) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GOOGLE_TOKENINFO_URL + idToken))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.warning("Google token verification failed with status: " + response.statusCode());
            throw new RuntimeException("Invalid Google token");
        }

        JsonNode node = objectMapper.readTree(response.body());

        if (node.has("error_description")) {
            throw new RuntimeException("Google token error: " + node.get("error_description").asText());
        }

        String email = node.has("email") ? node.get("email").asText() : null;
        String name = node.has("name") ? node.get("name").asText() : null;
        String sub = node.has("sub") ? node.get("sub").asText() : null;
        String emailVerified = node.has("email_verified") ? node.get("email_verified").asText() : "false";

        if (email == null || sub == null) {
            throw new RuntimeException("Invalid Google token: missing email or sub");
        }

        return new GoogleUserInfo(email, name, sub, "true".equals(emailVerified));
    }

    public static class GoogleUserInfo {
        public final String email;
        public final String name;
        public final String googleId;
        public final boolean emailVerified;

        public GoogleUserInfo(String email, String name, String googleId, boolean emailVerified) {
            this.email = email;
            this.name = name;
            this.googleId = googleId;
            this.emailVerified = emailVerified;
        }
    }
}
