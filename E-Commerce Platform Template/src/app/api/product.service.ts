import { apiClient } from './api-client';
import { getUserFromToken } from './auth.service';

export interface Product {
    id?: number;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    category: string;
    stock?: number;
    status?: boolean;
    createdAt?: string;
    tags?: string[];
}

// Vérifier que l'utilisateur a le rôle ADMIN
const checkAdminRole = () => {
    const user = getUserFromToken();
    if (!user) {
        throw new Error('Vous devez être connecté');
    }
    const roles: string[] = user.realm_access?.roles || user.roles || [];
    const isAdmin = roles.some((r: string) =>
        r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ROLE_ADMIN'
    );
    if (!isAdmin) {
        throw new Error('Accès refusé : rôle ADMIN requis');
    }
};

export const productService = {
    getAllProducts: async (): Promise<Product[]> => {
        return apiClient('/api/products', { skipAuthRedirect: true, omitAuthHeader: true, suppressNoTokenWarning: true });
    },

    getAllCategories: async (): Promise<string[]> => {
        return apiClient('/api/products/categories', { skipAuthRedirect: true, omitAuthHeader: true, suppressNoTokenWarning: true });
    },

    getProductById: async (id: number): Promise<Product> => {
        return apiClient(`/api/products/${id}`, { skipAuthRedirect: true, omitAuthHeader: true, suppressNoTokenWarning: true });
    },

    createProduct: async (formData: FormData): Promise<Product> => {
        checkAdminRole();
        return apiClient('/api/products', {
            method: 'POST',
            body: formData,
        });
    },

    updateProduct: async (id: number, product: Product): Promise<Product> => {
        checkAdminRole();
        return apiClient(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
    },

    deleteProduct: async (id: number): Promise<void> => {
        checkAdminRole();
        return apiClient(`/api/products/${id}`, {
            method: 'DELETE',
        });
    },

    addToFavorites: async (productId: number): Promise<string> => {
        const user = getUserFromToken();
        if (!user) {
            throw new Error('You must be logged in to add to favorites');
        }
        return apiClient(`/api/products/favorites/${productId}`, {
            method: 'POST',
        });
    },

    removeFromFavorites: async (productId: number): Promise<string> => {
        const user = getUserFromToken();
        if (!user) {
            throw new Error('You must be logged in to remove from favorites');
        }
        return apiClient(`/api/products/favorites/${productId}`, {
            method: 'DELETE',
        });
    },

    checkIfFavorite: async (productId: number): Promise<boolean> => {
        const user = getUserFromToken();
        if (!user) {
            return false;
        }
        try {
            await apiClient(`/api/products/favorites/${productId}`, { skipAuthRedirect: true });
            return true;
        } catch {
            return false;
        }
    },

    getFavorites: async (): Promise<Product[]> => {
        const user = getUserFromToken();
        if (!user) {
            throw new Error('You must be logged in to view your favorites');
        }
        return apiClient('/api/products/favorites');
    },

    // Obtenir le nombre de favoris
    getFavoritesCount: async (): Promise<number> => {
        const user = getUserFromToken();
        if (!user) {
            return 0;
        }
        try {
            const favorites = await apiClient('/api/products/favorites', {
                skipAuthRedirect: true,
                suppressNoTokenWarning: true,
            });
            return Array.isArray(favorites) ? favorites.length : 0;
        } catch (error) {
            console.error('Failed to get favorites count:', error);
            return 0;
        }
    },

    // Enregistrer un clic sur un produit
    recordClick: async (productId: number): Promise<{ message: string; productId: string; userId: string }> => {
        const user = getUserFromToken();
        if (!user) {
            return { message: 'Click recorded (not authenticated)', productId: productId.toString(), userId: 'anonymous' };
        }
        try {
            return apiClient(`/api/products/${productId}/click`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to record click:', error);
            return { message: 'Click recorded locally', productId: productId.toString(), userId: user.sub || '' };
        }
    },

    // Enregistrer un ajout aux favoris (interaction)
    recordFavoriteInteraction: async (productId: number): Promise<{ message: string; productId: string; userId: string }> => {
        const user = getUserFromToken();
        if (!user) {
            return { message: 'Favorite recorded (not authenticated)', productId: productId.toString(), userId: 'anonymous' };
        }
        try {
            return apiClient(`/api/products/${productId}/favorite`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to record favorite interaction:', error);
            return { message: 'Favorite recorded locally', productId: productId.toString(), userId: user.sub || '' };
        }
    },
};
