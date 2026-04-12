package esprit.microservice1.services;

import esprit.microservice1.dto.*;
import esprit.microservice1.entities.Role;
import esprit.microservice1.entities.User;
import esprit.microservice1.repositories.UserRespository;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;

@Service
public class KeycloakServiceImpl implements KeycloakService {

    private final Keycloak keycloak;
    private final RestTemplate restTemplate;

    @Value("${keycloak.auth-server-url}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Autowired
    private UserRespository userRepository;

    @Value("${keycloak.admin.realm:master}")
    private String adminRealm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String adminClientId;

    @Value("${keycloak.admin.client-secret:}")
    private String adminClientSecret;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    @Value("${google.recaptcha.secret-key}")
    private String captchaSecret;

    public KeycloakServiceImpl(Keycloak keycloak, RestTemplate restTemplate) {
        this.keycloak = keycloak;
        this.restTemplate = restTemplate;
    }

    /**
     * Obtient un token d'accès admin pour les opérations Keycloak
     */
    private String getAdminAccessToken() {
        String cleanServerUrl = keycloakServerUrl.trim();
        String cleanRealm = adminRealm.trim();
        String tokenUrl = cleanServerUrl + "/realms/" + cleanRealm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("grant_type", "password");
        requestBody.add("client_id", adminClientId.trim());
        if (adminClientSecret != null && !adminClientSecret.trim().isEmpty()) {
            requestBody.add("client_secret", adminClientSecret.trim());
        }
        requestBody.add("username", adminUsername.trim());
        requestBody.add("password", adminPassword.trim());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

        System.out.println("Getting Admin Token from: " + tokenUrl);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            throw new RuntimeException("Failed to get admin access token. Status: " + response.getStatusCode());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Error getting admin token from URL: " + tokenUrl);
            System.err.println("Response body: " + e.getResponseBodyAsString());
            throw new RuntimeException("Error getting admin token from " + tokenUrl + " : " + e.getStatusCode() + " - "
                    + e.getResponseBodyAsString(), e);
        }
    }

    @Override
    public LoginResponse login(String usernameOrEmail, String password, String totp, String captchaToken) {
        System.out.println(">>> Attempting login for: " + usernameOrEmail);

        // Check CAPTCHA
        verifyCaptcha(captchaToken);

        try {
            // 1. Chercher l'utilisateur par username OU par email dans la DB locale
            User user = userRepository.findByUsername(usernameOrEmail)
                    .or(() -> userRepository.findByEmail(usernameOrEmail))
                    .orElseThrow(() -> {
                        System.err.println("User not found in local DB: " + usernameOrEmail);
                        return new RuntimeException(
                                "Utilisateur non trouvé dans la base de données locale. Veuillez vous inscrire d'abord.");
                    });

            System.out.println("✓ User found in local DB: " + user.getUsername());

            // 2. Vérifier si le compte est activé
            if (!user.isEnabled()) {
                System.err.println("User account disabled: " + user.getUsername());
                throw new RuntimeException("Le compte utilisateur est désactivé.");
            }

            // Utiliser le vrai username pour Keycloak
            String actualUsername = user.getUsername();
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            System.out.println("Calling Keycloak token endpoint: " + tokenUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("grant_type", "password");
            requestBody.add("client_id", clientId);
            requestBody.add("client_secret", clientSecret);
            requestBody.add("username", actualUsername);
            requestBody.add("password", password);
            if (totp != null && !totp.isEmpty()) {
                requestBody.add("totp", totp);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        tokenUrl,
                        HttpMethod.POST,
                        request,
                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                        });

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    System.out.println("✓ Keycloak authentication successful");
                    Map<String, Object> body = response.getBody();
                    long expiresIn = ((Number) body.get("expires_in")).longValue();
                    long refreshExpiresIn = body.containsKey("refresh_expires_in")
                            ? ((Number) body.get("refresh_expires_in")).longValue()
                            : 0;
                    LoginResponse loginResponse = new LoginResponse(
                            (String) body.get("access_token"),
                            (String) body.get("refresh_token"),
                            expiresIn,
                            refreshExpiresIn,
                            (String) body.get("token_type"));

                    loginResponse.setUserId(user.getIdKeycloak());
                    loginResponse.setUsername(user.getUsername());
                    loginResponse.setRole(user.getRole() != null ? user.getRole().name() : "USER");
                    loginResponse.setImageUrl(user.getImageUrl());

                    return loginResponse;
                }

                System.err.println("Keycloak returned unexpected status: " + response.getStatusCode());
                throw new RuntimeException("Échec de l'authentification auprès de Keycloak.");

            } catch (org.springframework.web.client.HttpClientErrorException e) {
                String responseBody = e.getResponseBodyAsString();
                HttpStatus statusCode = (HttpStatus) e.getStatusCode();
                System.err.println("Keycloak Error Details - Status: " + statusCode + " Body: [" + responseBody + "]");

                // Detection du besoin de MFA ou de configuration
                if (responseBody.contains("mfa_required") || responseBody.contains("invalid_grant")
                        || statusCode == HttpStatus.UNAUTHORIZED) {

                    if (responseBody.contains("Account is not fully set up")
                            || responseBody.contains("Account setup required")) {
                        String accountUrl = keycloakServerUrl + "/realms/" + realm + "/account/";
                        throw new RuntimeException(
                                "SETUP_REQUIRED: Votre compte nécessite une configuration initiale du 2FA. Veuillez vous connecter une fois sur "
                                        + accountUrl + " pour scanner le QR Code.");
                    }

                    // Si on n'a pas encore envoyé de TOTP et qu'on reçoit 401, il y a de fortes
                    // chances que ce soit du MFA
                    // Mais on ne veut pas l'afficher si c'est juste un mauvais mot de passe.
                    // Cependant, pour aider le debug, on va rajouter un flag dans le message si on
                    // suspecte MFA.
                    if (totp == null || totp.isEmpty()) {
                        // Keycloak renvoie souvent invalid_grant pour MFA requis
                        if (responseBody.contains("mfa_required") || responseBody.contains("MFA required")
                                || responseBody.contains("invalid_grant")) {
                            throw new RuntimeException("MFA_REQUIRED: Code de double authentification requis.");
                        }
                    } else {
                        if (responseBody.contains("invalid_grant")) {
                            throw new RuntimeException(
                                    "Code de double authentification invalide ou mot de passe incorrect.");
                        }
                    }
                }

                if (statusCode == HttpStatus.UNAUTHORIZED) {
                    throw new RuntimeException("Identifiants incorrects ou double authentification requise.");
                }

                throw new RuntimeException(
                        "Erreur Keycloak: " + statusCode + " - " + responseBody);
            }

        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public LoginResponse socialLogin(String code, String redirectUri) {
        System.out.println(">>> Attempting social login exchange for code: " + code);
        try {
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("grant_type", "authorization_code");
            requestBody.add("client_id", clientId);
            requestBody.add("client_secret", clientSecret);
            requestBody.add("code", code);
            requestBody.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String accessToken = (String) body.get("access_token");
                String refreshToken = (String) body.get("refresh_token");
                long expiresIn = ((Number) body.get("expires_in")).longValue();
                long refreshExpiresIn = body.containsKey("refresh_expires_in")
                        ? ((Number) body.get("refresh_expires_in")).longValue()
                        : 0;
                String tokenType = (String) body.get("token_type");

                // Sync user with local DB
                syncSocialUser(accessToken);

                return new LoginResponse(accessToken, refreshToken, expiresIn, refreshExpiresIn, tokenType);
            }

            throw new RuntimeException("Failed to exchange social code for tokens");
        } catch (Exception e) {
            System.err.println("Social login error: " + e.getMessage());
            throw new RuntimeException("Social login failed: " + e.getMessage());
        }
    }

    /**
     * Fetch user info from Keycloak and sync with local DB if necessary
     */
    private void syncSocialUser(String accessToken) {
        try {
            // Instead of calling userinfo endpoint (which might fail with 401),
            // we decode the access_token JWT directly
            String[] chunks = accessToken.split("\\.");
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> userInfo = mapper.readValue(payload, Map.class);

            String keycloakId = (String) userInfo.get("sub");
            String username = (String) userInfo.get("preferred_username");
            String email = (String) userInfo.get("email");

            String effectiveUsername = username != null ? username : email;
            if (effectiveUsername == null)
                effectiveUsername = keycloakId;

            // Check if user exists in local DB
            boolean alreadyExists = userRepository.findByIdKeycloak(keycloakId).isPresent() ||
                    (email != null && userRepository.findByEmail(email).isPresent()) ||
                    (effectiveUsername != null && userRepository.findByUsername(effectiveUsername).isPresent());

            if (!alreadyExists) {

                System.out.println("Syncing new social user: " + effectiveUsername);
                User newUser = new User();
                newUser.setIdKeycloak(keycloakId);
                newUser.setUsername(effectiveUsername);
                newUser.setEmail(email != null ? email : effectiveUsername + "@social.com");
                newUser.setPassword("SOCIAL_LOGIN_MANAGED");
                newUser.setRole(Role.USER);
                newUser.setCreatedAt(java.time.LocalDateTime.now());
                userRepository.save(newUser);
                System.out.println("✓ Social user saved to MySQL.");
            } else {
                System.out.println("Social user already exists in MySQL.");
            }
        } catch (Exception e) {
            System.err.println("Failed to sync social user from JWT: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void logout(String refreshToken) {
        try {
            String logoutUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/logout";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("client_id", clientId);
            requestBody.add("client_secret", clientSecret);
            requestBody.add("refresh_token", refreshToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(logoutUrl, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage(), e);
        }
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        try {
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("grant_type", "refresh_token");
            requestBody.add("client_id", clientId);
            requestBody.add("client_secret", clientSecret);
            requestBody.add("refresh_token", refreshToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                long expiresIn = ((Number) body.get("expires_in")).longValue();
                long refreshExpiresIn = body.containsKey("refresh_expires_in")
                        ? ((Number) body.get("refresh_expires_in")).longValue()
                        : 0;
                return new LoginResponse(
                        (String) body.get("access_token"),
                        (String) body.get("refresh_token"),
                        expiresIn,
                        refreshExpiresIn,
                        (String) body.get("token_type"));
            }

            throw new RuntimeException("Failed to refresh token");
        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public String registerUser(UserRegistrationDto dto) {
        System.out.println(">>> START REGISTER USER <<<");

        // Check CAPTCHA
        verifyCaptcha(dto.getRecaptchaToken());

        System.out.println("Username: " + dto.getUsername());
        System.out.println("Email: " + dto.getEmail());

        String userId = null;

        try {
            // 1. Vérifications dans la base de données locale
            if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists in local database");
            }
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists in local database");
            }

            // 2. Créer l'utilisateur dans Keycloak
            userId = createUserInKeycloak(dto);
            System.out.println("✓ User created in Keycloak with ID: " + userId);

            // 3. Définir le mot de passe
            setUserPassword(userId, dto.getPassword());
            System.out.println("✓ Password set successfully");

            // 4. Assigner le rôle par défaut
            assignRole(userId, "USER");
            System.out.println("✓ Role USER assigned");

            // 5. Sauvegarder dans la base de données locale
            saveUserToLocalDb(userId, dto);
            System.out.println("✓ User saved to local database");

            System.out.println(">>> REGISTER USER COMPLETED SUCCESSFULLY <<<");
            return userId;

        } catch (Exception e) {
            System.err.println("✗ Registration failed: " + e.getMessage());
            e.printStackTrace();

            // Rollback : supprimer l'utilisateur Keycloak si créé
            if (userId != null) {
                try {
                    deleteUser(userId);
                    System.out.println("✓ Keycloak user rolled back");
                } catch (Exception rollbackEx) {
                    System.err.println("✗ Rollback failed: " + rollbackEx.getMessage());
                }
            }

            throw new RuntimeException("User registration failed: " + e.getMessage(), e);
        }
    }

    /**
     * Crée un utilisateur dans Keycloak via l'API REST
     */
    private String createUserInKeycloak(UserRegistrationDto dto) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(true);

        if (dto.getPhone() != null && !dto.getPhone().isEmpty()) {
            user.singleAttribute("phone", dto.getPhone());
        }

        String createUserUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users";
        System.out.println("Creating user at: " + createUserUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(getAdminAccessToken());

        HttpEntity<UserRepresentation> request = new HttpEntity<>(user, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    createUserUrl,
                    HttpMethod.POST,
                    request,
                    String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                String location = response.getHeaders().getLocation().toString();
                String userId = location.substring(location.lastIndexOf('/') + 1);
                return userId;
            }

            throw new RuntimeException("Unexpected status code: " + response.getStatusCode());

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Keycloak API Error: " + e.getStatusCode());
            System.err.println("Response: " + e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Keycloak user creation failed: " + e.getStatusCode() +
                            " - " + e.getResponseBodyAsString(),
                    e);
        }
    }

    /**
     * Définit le mot de passe d'un utilisateur dans Keycloak
     */
    private void setUserPassword(String userId, String password) {
        String adminToken = getAdminAccessToken();
        String url = keycloakServerUrl.trim() + "/admin/realms/" + realm.trim() + "/users/" + userId
                + "/reset-password";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        String body = "{\"type\":\"password\",\"value\":\"" + password + "\",\"temporary\":false}";
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Password configuration failed for user: " + userId, e);
        }
    }

    /**
     * Sauvegarde l'utilisateur dans la base de données locale
     * Note: Le mot de passe n'est PAS stocké car géré par Keycloak
     */
    private void saveUserToLocalDb(String keycloakId, UserRegistrationDto dto) {
        User dbUser = new User();
        dbUser.setIdKeycloak(keycloakId);
        dbUser.setUsername(dto.getUsername());
        dbUser.setEmail(dto.getEmail());
        // Stocker un placeholder - le vrai mot de passe est géré par Keycloak
        dbUser.setPassword("MANAGED_BY_KEYCLOAK");
        dbUser.setRole(Role.USER);
        dbUser.setPhone(dto.getPhone());

        userRepository.save(dbUser);
    }

    @Override
    public void updateUser(String userId, UserUpdateDto dto) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            UserRepresentation user = userResource.toRepresentation();

            if (dto.getEmail() != null) {
                user.setEmail(dto.getEmail());
            }
            if (dto.getFirstName() != null) {
                user.setFirstName(dto.getFirstName());
            }
            if (dto.getLastName() != null) {
                user.setLastName(dto.getLastName());
            }
            if (dto.getPhone() != null) {
                user.singleAttribute("phone", dto.getPhone());
            }

            userResource.update(user);

            // Mettre à jour également dans la base de données locale si nécessaire
            userRepository.findByIdKeycloak(userId).ifPresent(dbUser -> {
                if (dto.getEmail() != null)
                    dbUser.setEmail(dto.getEmail());
                if (dto.getPhone() != null)
                    dbUser.setPhone(dto.getPhone());
                userRepository.save(dbUser);
            });

        } catch (Exception e) {
            throw new RuntimeException("User update failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteUser(String userId) {
        try {
            // 1. Supprimer dans Keycloak
            keycloak.realm(realm).users().get(userId).remove();

            // 2. Supprimer dans la DB locale
            userRepository.findByIdKeycloak(userId).ifPresent(userRepository::delete);

        } catch (Exception e) {
            throw new RuntimeException("User deletion failed: " + e.getMessage(), e);
        }
    }

    @Override
    public User getUser(String userId) {
        return userRepository.findByIdKeycloak(userId)
                .orElseThrow(() -> new RuntimeException("User not found with Keycloak ID: " + userId));
    }

    @Override
    public void assignRole(String userId, String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            // Vérifier si le rôle existe et le récupérer
            try {
                RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
                // Assigner le rôle à l'utilisateur
                userResource.roles().realmLevel().add(Collections.singletonList(role));
            } catch (jakarta.ws.rs.NotFoundException e) {
                throw new RuntimeException(
                        "Role '" + roleName + "' not found in realm '" + realm + "'. " +
                                "Please create this role in Keycloak admin console first.",
                        e);
            }
        } catch (Exception e) {
            throw new RuntimeException("Role assignment failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void enable2FA(String userId) {
        try {
            UserResource userResource = keycloak.realm(realm).users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            if (user.getRequiredActions() == null) {
                user.setRequiredActions(new java.util.ArrayList<>());
            }
            if (!user.getRequiredActions().contains("CONFIGURE_TOTP")) {
                user.getRequiredActions().add("CONFIGURE_TOTP");
            }
            userResource.update(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enable 2FA: " + e.getMessage(), e);
        }
    }

    @Override
    public void disable2FA(String userId) {
        try {
            UserResource userResource = keycloak.realm(realm).users().get(userId);

            // Remove TOTP credentials
            userResource.credentials().stream()
                    .filter(c -> "otp".equals(c.getType()))
                    .forEach(c -> userResource.removeCredential(c.getId()));

            // Remove CONFIGURE_TOTP from required actions
            UserRepresentation user = userResource.toRepresentation();
            if (user.getRequiredActions() != null && user.getRequiredActions().contains("CONFIGURE_TOTP")) {
                user.getRequiredActions().remove("CONFIGURE_TOTP");
                userResource.update(user);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to disable 2FA: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean is2FAEnabled(String userId) {
        try {
            UserResource userResource = keycloak.realm(realm).users().get(userId);
            return userResource.credentials().stream()
                    .anyMatch(c -> "otp".equals(c.getType()));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void updateProfileImage(String userId, String imageUrl) {
        // 1. Update local DB
        User user = userRepository.findByIdKeycloak(userId)
                .orElseThrow(() -> new RuntimeException("User not found with Keycloak ID: " + userId));
        user.setImageUrl(imageUrl);
        userRepository.save(user);

        // 2. Update Keycloak attributes
        try {
            UserResource userResource = keycloak.realm(realm).users().get(userId);
            UserRepresentation userRep = userResource.toRepresentation();
            if (userRep.getAttributes() == null) {
                userRep.setAttributes(new java.util.HashMap<>());
            }
            userRep.getAttributes().put("imageUrl", java.util.Collections.singletonList(imageUrl));
            userResource.update(userRep);
            System.out.println("✓ Profile image updated in Keycloak and MySQL for user: " + userId);
        } catch (Exception e) {
            System.err.println("Failed to update imageUrl in Keycloak: " + e.getMessage());
        }
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found with username or email: " + username));
    }

    @Override
    public LoginResponse loginByFaceId(String username) {
        System.out.println(">>> Attempting FaceID login (Token Exchange) for: " + username);

        // 1. Verify user exists in local DB and has a profile image
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));

        if (user.getImageUrl() == null || user.getImageUrl().isEmpty()) {
            throw new RuntimeException("FaceID n'est pas configuré pour ce compte (image manquante).");
        }

        // 2. In a real scenario, we would use Keycloak's Token Exchange or a Custom
        // Provider.
        // For this demo/template, we'll use the admin's ability to get a token or
        // fallback to a "trusted" login flow.
        try {
            // We use the admin status to "vouch" for the user.
            // Here we try to get a token for the user using the client credentials
            // but we'll simulate the response for the demo if direct password bypass is not
            // set.

            // For the purpose of this template, let's use the admin credentials to get a
            // valid token
            // that the frontend can use, but we'll try to get one that belongs to the user
            // context.

            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("grant_type", "client_credentials");
            requestBody.add("client_id", clientId);
            requestBody.add("client_secret", clientSecret);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                LoginResponse loginResponse = new LoginResponse(
                        (String) body.get("access_token"),
                        (String) body.get("refresh_token"),
                        ((Number) body.get("expires_in")).longValue(),
                        body.containsKey("refresh_expires_in") ? ((Number) body.get("refresh_expires_in")).longValue()
                                : 0,
                        (String) body.get("token_type"));

                loginResponse.setUserId(user.getIdKeycloak());
                loginResponse.setUsername(user.getUsername());
                loginResponse.setImageUrl(user.getImageUrl());
                loginResponse.setRole(user.getRole() != null ? user.getRole().toString() : "USER");

                System.out.println(
                        ">>> FaceID login successful for " + username + " with role " + loginResponse.getRole());
                return loginResponse;
            }
            throw new RuntimeException("Échec de la génération du jeton FaceID.");
        } catch (Exception e) {
            System.err.println("FaceID login error: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la connexion FaceID : " + e.getMessage());
        }
    }

    private void verifyCaptcha(String token) {
        System.out.println("Verifying CAPTCHA token...");
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("CAPTCHA token is missing.");
        }

        String url = "https://www.google.com/recaptcha/api/siteverify";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", captchaSecret);
        map.add("response", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> body = response.getBody();

            if (body == null || !((Boolean) body.get("success"))) {
                System.err.println("CAPTCHA verification failed: " + body);
                throw new RuntimeException("Validation CAPTCHA échouée. Veuillez réessayer.");
            }
            System.out.println("✓ CAPTCHA verified successfully.");
        } catch (Exception e) {
            System.err.println("Error during CAPTCHA verification: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la vérification du CAPTCHA : " + e.getMessage());
        }
    }
}