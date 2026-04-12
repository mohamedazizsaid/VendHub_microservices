import { useCallback, useEffect } from 'react';
import { productService } from '../api/product.service';

export const useProductInteraction = () => {
    const recordClick = useCallback(async (productId: number) => {
        try {
            await productService.recordClick(productId);
        } catch (error) {
            console.error('Failed to record click:', error);
        }
    }, []);

    const recordFavorite = useCallback(async (productId: number) => {
        try {
            await productService.recordFavoriteInteraction(productId);
            // Dispatcher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('favorites-changed'));
        } catch (error) {
            console.error('Failed to record favorite interaction:', error);
        }
    }, []);

    return { recordClick, recordFavorite };
};

export const useTrackProductView = (productId: number | undefined) => {
    useEffect(() => {
        if (productId) {
            productService.recordClick(productId).catch(() => {});
        }
    }, [productId]);
};
