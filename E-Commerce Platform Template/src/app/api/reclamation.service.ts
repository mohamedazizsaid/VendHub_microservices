import { apiClient } from './api-client';

export interface Reclamation {
    id?: number;
    userId: number;
    commandeId?: number;
    title: string;
    description: string;
    reply?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export const reclamationService = {
    getAllReclamations: async (): Promise<Reclamation[]> => {
        return apiClient('/api/reclamations');
    },

    getReclamationById: async (id: number): Promise<Reclamation> => {
        return apiClient(`/api/reclamations/${id}`);
    },

    getReclamationsByUserId: async (userId: number): Promise<Reclamation[]> => {
        return apiClient(`/api/reclamations/user/${userId}`);
    },

    getReclamationsByCommandeId: async (commandeId: number): Promise<Reclamation[]> => {
        return apiClient(`/api/reclamations/commande/${commandeId}`);
    },

    getReclamationsByStatus: async (status: string): Promise<Reclamation[]> => {
        return apiClient(`/api/reclamations/status/${status}`);
    },

    createReclamation: async (reclamation: Partial<Reclamation>): Promise<Reclamation> => {
        return apiClient('/api/reclamations', {
            method: 'POST',
            body: JSON.stringify(reclamation),
        });
    },

    updateReclamation: async (id: number, reclamation: Partial<Reclamation>): Promise<Reclamation> => {
        return apiClient(`/api/reclamations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reclamation),
        });
    },

    deleteReclamation: async (id: number): Promise<void> => {
        return apiClient(`/api/reclamations/${id}`, {
            method: 'DELETE',
        });
    },
};
