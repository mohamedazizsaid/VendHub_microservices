package esprit.microservice1.services;

import esprit.microservice1.dto.LoginResponse;
import esprit.microservice1.dto.UserRegistrationDto;
import esprit.microservice1.dto.UserUpdateDto;
import esprit.microservice1.entities.Statut;
import esprit.microservice1.entities.User;
import org.springframework.data.domain.Page;

public interface KeycloakService {

    /**
     * Authenticate user and get access and refresh tokens
     * 
     * @param usernameOrEmail User's username or email
     * @param password        User's password
     * @param totp            Time-based One-Time Password (if 2FA is enabled)
     * @return LoginResponse containing tokens
     */
    LoginResponse login(String usernameOrEmail, String password, String totp, String recaptchaToken);

    /**
     * Authenticate user using social login (Google/Facebook) and sync with local DB
     * 
     * @param code        Authorization code from Keycloak
     * @param redirectUri The redirect URI used in the request
     * @return LoginResponse containing tokens
     */
    LoginResponse socialLogin(String code, String redirectUri);

    void sendPasswordResetCode(String email);

    void resetPasswordWithCode(String email, String code, String newPassword);

    /**
     * Logout user by invalidating refresh token
     * 
     * @param refreshToken Refresh token to invalidate
     */
    void logout(String refreshToken);

    /**
     * Refresh access token using refresh token
     * 
     * @param refreshToken Valid refresh token
     * @return LoginResponse with new access token
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * Register a new user in Keycloak
     * 
     * @param dto User registration data
     * @return User ID in Keycloak
     */
    String registerUser(UserRegistrationDto dto);

    /**
     * Update user information in Keycloak
     * 
     * @param userId Keycloak user ID
     * @param dto    User update data
     */
    void updateUser(String userId, UserUpdateDto dto);

    /**
     * Delete user from Keycloak
     * 
     * @param userId Keycloak user ID
     */
    void deleteUser(String userId);

    User getUser(String userId);

    /**
     * Assign a role to a user
     * 
     * @param userId   Keycloak user ID
     * @param roleName Role name (e.g., "ADMIN", "USER")
     */
    void assignRole(String userId, String roleName);

    /**
     * Enable 2FA for a user by adding CONFIGURE_TOTP required action
     * 
     * @param userId Keycloak user ID
     */
    void enable2FA(String userId);

    /**
     * Disable 2FA for a user by removing TOTP credentials
     * 
     * @param userId Keycloak user ID
     */
    void disable2FA(String userId);

    /**
     * Update user's profile image in Keycloak
     *
     * @param userId   Keycloak user ID
     * @param imageUrl URL of the new profile image
     */
    void updateProfileImage(String userId, String imageUrl);

    /**
     * Check if 2FA is enabled for a user
     * 
     * @param userId Keycloak user ID
     * @return true if 2FA is enabled
     */
    boolean is2FAEnabled(String userId);

    User getUserByUsername(String username);

    LoginResponse loginByFaceId(String username);

    Page<User> getUsers(int page, int size, String search, String role, String status);

    void updateUserStatus(String userId, Statut statut);
}
