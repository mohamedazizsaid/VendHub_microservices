import { apiClient } from './api-client';

export interface LoginRequest {
    username: string;
    password?: string;
    totp?: string;
    recaptchaToken?: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    userId?: string;
    username?: string;
    imageUrl?: string;
    role?: string;
}

export interface UserRegistrationDto {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    phone?: string;
    recaptchaToken?: string;
}

export interface UserUpdateDto {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    idKeycloak: string;
    phone: string;
    imageUrl?: string;
    roles: string[];
}


export interface RoleAssignmentRequest {
    roleName: string;
}

export const getUserFromToken = () => {
    // Priority 1: FaceID override (stashed during loginByFaceId)
    const faceIdUser = localStorage.getItem('faceIdUser');
    if (faceIdUser) return JSON.parse(faceIdUser);

    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const authService = {
    login: async (request: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(request),
        });
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);

        // Stash the real user metadata for the UI (overrides/complements token data)
        if (response.userId) {
            localStorage.setItem('faceIdUser', JSON.stringify({
                sub: response.userId,
                preferred_username: response.username,
                name: response.username,
                roles: response.role ? [response.role] : []
            }));
        }

        return response;
    },

    socialLogin: async (code: string, redirectUri: string): Promise<LoginResponse> => {
        const response = await apiClient('/api/auth/social-login', {
            method: 'POST',
            body: JSON.stringify({ code, redirectUri }),
        });
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        return response;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('faceIdUser');
    },

    refresh: async (refreshToken: string): Promise<LoginResponse> => {
        const response = await apiClient('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        localStorage.setItem('token', response.access_token);
        return response;
    },

    register: async (dto: UserRegistrationDto): Promise<string> => {
        return apiClient('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    updateUser: async (userId: string, dto: UserUpdateDto): Promise<string> => {
        return apiClient(`/api/auth/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(dto),
        });
    },

    deleteUser: async (userId: string): Promise<string> => {
        return apiClient(`/api/auth/users/${userId}`, {
            method: 'DELETE',
        });
    },

    assignRole: async (userId: string, roleName: string): Promise<string> => {
        return apiClient(`/api/auth/users/${userId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ roleName }),
        });
    },

    enable2FA: async (userId: string): Promise<string> => {
        return apiClient(`/api/auth/users/${userId}/2fa/enable`, {
            method: 'POST',
        });
    },

    disable2FA: async (userId: string): Promise<string> => {
        return apiClient(`/api/auth/users/${userId}/2fa/disable`, {
            method: 'POST',
        });
    },

    get2FAStatus: async (userId: string): Promise<{ enabled: boolean }> => {
        return apiClient(`/api/auth/users/${userId}/2fa/status`, {
            method: 'GET',
        });
    },

    getUser: async (userId: string): Promise<User> => {
        return apiClient(`/api/auth/users/${userId}`, {
            method: 'GET',
        });
    },


    updateProfileImage: async (userId: string, file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient(`/api/auth/users/${userId}/image`, {
            method: 'POST',
            body: formData,
        });
    },

    getUserByUsername: async (username: string): Promise<User> => {
        return apiClient(`/api/auth/users/username/${username}`, {
            method: 'GET',
        });
    },

    loginByFaceId: async (username: string): Promise<LoginResponse> => {
        const response = await apiClient('/api/auth/login-faceid', {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);

        // Stash the real user metadata for the UI (overrides technical token 'sub')
        if (response.userId) {
            localStorage.setItem('faceIdUser', JSON.stringify({
                sub: response.userId,
                preferred_username: response.username,
                name: response.username,
                roles: response.role ? [response.role] : []
            }));
        }

        return response;
    },
};
