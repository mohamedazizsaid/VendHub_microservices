import { apiClient } from './api-client';

export const cloudinaryService = {
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Appel à l'endpoint backend qui gérera l'upload vers Cloudinary
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.imageUrl; // L'URL de l'image depuis Cloudinary
    },
};
