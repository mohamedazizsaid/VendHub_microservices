import { apiClient } from './api-client';
import { Product } from './product.service';
import { getUserFromToken } from './auth.service';

export interface InteractionStats {
    CLICK: number;
    FAVORITE: number;
}

export const recommendationService = {
    getPersonalizedRecommendations: async (limit: number = 10): Promise<Product[]> => {
        const user = getUserFromToken();
        if (!user) {
            return [];
        }
        return apiClient(`/api/products/recommendations?limit=${limit}`, { skipAuthRedirect: true });
    },

    getPopularProducts: async (limit: number = 10): Promise<Product[]> => {
        return apiClient(`/api/products/popular?limit=${limit}`, { skipAuthRedirect: true });
    },

    getInteractionStats: async (): Promise<InteractionStats> => {
        const user = getUserFromToken();
        if (!user) {
            throw new Error('You must be logged in to view your statistics');
        }
        return apiClient('/api/products/my-stats', { skipAuthRedirect: true });
    },
};
