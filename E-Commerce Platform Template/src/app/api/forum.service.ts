import { apiClient } from './api-client';

export interface Forum {
    id?: number;
    title: string;
    description: string;
    createdAt?: string;
}

export interface Message {
    id?: number;
    content: string;
    authorId: number;
    authorName: string;
    forumId: number;
    createdAt?: string;
}

export const forumService = {
    // Forums
    getAllForums: async (): Promise<Forum[]> => {
        return apiClient('/api/forums');
    },

    getForumById: async (id: number): Promise<Forum> => {
        return apiClient(`/api/forums/${id}`);
    },

    createForum: async (forum: Partial<Forum>): Promise<Forum> => {
        return apiClient('/api/forums', {
            method: 'POST',
            body: JSON.stringify(forum),
        });
    },

    updateForum: async (id: number, forum: Partial<Forum>): Promise<Forum> => {
        return apiClient(`/api/forums/${id}`, {
            method: 'PUT',
            body: JSON.stringify(forum),
        });
    },

    deleteForum: async (id: number): Promise<void> => {
        return apiClient(`/api/forums/${id}`, {
            method: 'DELETE',
        });
    },

    // Messages (Assuming a similar pattern for MessageController)
    getMessagesByForumId: async (forumId: number): Promise<Message[]> => {
        return apiClient(`/api/messages/forum/${forumId}`);
    },

    createMessage: async (message: Partial<Message>): Promise<Message> => {
        return apiClient('/api/messages', {
            method: 'POST',
            body: JSON.stringify(message),
        });
    },

    deleteMessage: async (id: number): Promise<void> => {
        return apiClient(`/api/messages/${id}`, {
            method: 'DELETE',
        });
    },
};
