import { apiClient } from './api-client';

export interface LigneCommande {
    id?: number;
    produitId: number;
    nomProduit: string;
    prixUnitaire: number;
    quantite: number;
}

export interface Commande {
    id?: number;
    clientId: string;
    clientName: string;
    clientAddress: string;
    clientPhone: string;
    prixTotal: number;
    status: 'processing' | 'in_transit' | 'delivered' | string;
    createdAt?: string;
    lignesCommande?: LigneCommande[];
}

export const orderService = {
    getCommandeById: async (id: number): Promise<Commande> => {
        return apiClient(`/api6/commandes/${id}`);
    },

    getCommandesByClientId: async (clientId: string): Promise<Commande[]> => {
        return apiClient(`/api6/commandes/client/${encodeURIComponent(clientId)}`);
    },

    getAllCommandes: async (): Promise<Commande[]> => {
        return apiClient('/api6/commandes');
    },

    createCommande: async (commande: Commande): Promise<Commande> => {
        return apiClient('/api6/commandes', {
            method: 'POST',
            body: JSON.stringify(commande),
        });
    },

    updateCommandeStatus: async (id: number, status: string): Promise<Commande> => {
        return apiClient(`/api6/commandes/${id}/status?status=${status}`, {
            method: 'PUT',
        });
    },

    deleteCommande: async (id: number): Promise<void> => {
        return apiClient(`/api6/commandes/${id}`, {
            method: 'DELETE',
        });
    },

    addLigneToCommande: async (commandeId: number, ligneId: number): Promise<Commande> => {
        return apiClient(`/api6/commandes/${commandeId}/lignes/${ligneId}`, {
            method: 'POST',
        });
    },
};
