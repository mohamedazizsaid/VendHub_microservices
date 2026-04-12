const BASE_URL = 'http://localhost:8085'; // Single entry point via Gateway

interface ApiClientOptions extends RequestInit {
    skipAuthRedirect?: boolean;
}

export const apiClient = async (endpoint: string, options: ApiClientOptions = {}) => {
    const token = localStorage.getItem('token');
    const { skipAuthRedirect = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
        ...(fetchOptions.headers || {}),
    };

    // Only set Content-Type to JSON if body is not FormData
    if (!(fetchOptions.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn('No token found in localStorage - request will be unauthorized');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (response.status === 204) {
        return null;
    }

    if (response.status === 401) {
        if (!skipAuthRedirect) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const errorMessage = typeof data === 'object' ? data.message || data.error || 'Something went wrong' : data;
        throw new Error(errorMessage || 'Something went wrong');
    }

    return data;
};
