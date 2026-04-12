package esprit.microservice1.controllers;

import esprit.microservice1.dto.*;
import esprit.microservice1.services.KeycloakService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final KeycloakService keycloakService;
    private final esprit.microservice1.services.CloudinaryService cloudinaryService;

    public AuthController(KeycloakService keycloakService,
            esprit.microservice1.services.CloudinaryService cloudinaryService) {
        this.keycloakService = keycloakService;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Login endpoint - authenticate user and get tokens
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = keycloakService.login(request.getUsername(), request.getPassword(),
                    request.getTotp(), request.getRecaptchaToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    /**
     * Social login endpoint - exchange code for tokens and sync user
     */
    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody SocialLoginRequest request) {
        try {
            LoginResponse response = keycloakService.socialLogin(request.getCode(), request.getRedirectUri());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    /**
     * Logout endpoint - invalidate refresh token
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody TokenRefreshRequest request) {
        try {
            keycloakService.logout(request.getRefreshToken());
            return ResponseEntity.ok("Logout successful");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Refresh token endpoint - get new access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        try {
            LoginResponse response = keycloakService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Register new user endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDto dto) {
        try {

            String userId = keycloakService.registerUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("User registered successfully with ID: " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Update user endpoint
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserUpdateDto dto) {
        try {
            keycloakService.updateUser(userId, dto);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User update failed: " + e.getMessage());
        }
    }

    /**
     * Delete user endpoint
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            keycloakService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User deletion failed: " + e.getMessage());
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(keycloakService.getUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Assign role to user endpoint
     */
    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<?> assignRole(@PathVariable String userId, @RequestBody RoleAssignmentRequest request) {
        try {
            keycloakService.assignRole(userId, request.getRoleName());
            return ResponseEntity.ok("Role assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Role assignment failed: " + e.getMessage());
        }
    }

    /**
     * Enable 2FA for user
     */
    @PostMapping("/users/{userId}/2fa/enable")
    public ResponseEntity<?> enable2FA(@PathVariable String userId) {
        try {
            keycloakService.enable2FA(userId);
            return ResponseEntity.ok("2FA configuration required. User will be prompted on next login.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to enable 2FA: " + e.getMessage());
        }
    }

    /**
     * Disable 2FA for user
     */
    @PostMapping("/users/{userId}/2fa/disable")
    public ResponseEntity<?> disable2FA(@PathVariable String userId) {
        try {
            keycloakService.disable2FA(userId);
            return ResponseEntity.ok("2FA disabled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to disable 2FA: " + e.getMessage());
        }
    }

    /**
     * Get 2FA status for user
     */
    @GetMapping("/users/{userId}/2fa/status")
    public ResponseEntity<?> get2FAStatus(@PathVariable String userId) {
        try {
            boolean enabled = keycloakService.is2FAEnabled(userId);
            return ResponseEntity.ok(java.util.Collections.singletonMap("enabled", enabled));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to get 2FA status: " + e.getMessage());
        }
    }

    @PostMapping("/users/{userId}/image")
    public ResponseEntity<?> uploadProfileImage(@PathVariable String userId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            java.util.Map<?, ?> uploadResult = cloudinaryService.upload(file);
            String imageUrl = (String) uploadResult.get("secure_url");
            keycloakService.updateProfileImage(userId, imageUrl);
            return ResponseEntity.ok(java.util.Collections.singletonMap("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Image upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            return ResponseEntity.ok(keycloakService.getUserByUsername(username));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login-faceid")
    public ResponseEntity<?> loginByFaceId(@RequestBody LoginRequest request) {
        System.out.println(">>> Controller: LoginByFaceId request for " + request.getUsername());
        try {
            LoginResponse response = keycloakService.loginByFaceId(request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(">>> Controller: LoginByFaceId failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FaceID Login Error: " + e.getMessage());
        }
    }
}
