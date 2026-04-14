import { apiClient } from './api-client';

export interface ForumUser {
    id?: number;
    username?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
    role?: string;
}

export interface Forum {
    id?: number;
    title: string;
    description: string;
    messages?: ForumMessage[];
}

export interface ForumMessage {
    id?: number;
    content: string;
    author?: string;
    iduser?: number;
    forumId?: number;
    createdAt?: string;
    user?: ForumUser | null;
}

const normalizeMessage = (message: any): ForumMessage => ({
    id: typeof message?.id === 'number' ? message.id : Number(message?.id || 0),
    content: String(message?.content || ''),
    author: message?.author ? String(message.author) : undefined,
    iduser: typeof message?.iduser === 'number' ? message.iduser : Number(message?.iduser || 0) || undefined,
    forumId: typeof message?.forumId === 'number' ? message.forumId : Number(message?.forumId || 0) || undefined,
    createdAt: message?.createdAt,
    user: message?.user || null,
});

const normalizeForum = (forum: any): Forum => ({
    id: typeof forum?.id === 'number' ? forum.id : Number(forum?.id || 0),
    title: String(forum?.title || ''),
    description: String(forum?.description || ''),
    messages: Array.isArray(forum?.messages) ? forum.messages.map(normalizeMessage) : [],
});

export const forumService = {
    getForums: async (): Promise<Forum[]> => {
        const data = await apiClient('/api/forums', { method: 'GET' });
        return Array.isArray(data) ? data.map(normalizeForum) : [];
    },

    getForumById: async (id: number): Promise<Forum> => {
        const data = await apiClient(`/api/forums/${id}`, { method: 'GET' });
        return normalizeForum(data);
    },

    createForum: async (payload: Partial<Forum>): Promise<Forum> => {
        const data = await apiClient('/api/forums', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return normalizeForum(data);
    },

    updateForum: async (id: number, payload: Partial<Forum>): Promise<Forum> => {
        const data = await apiClient(`/api/forums/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return normalizeForum(data);
    },

    deleteForum: async (id: number): Promise<void> => {
        await apiClient(`/api/forums/${id}`, {
            method: 'DELETE',
        });
    },

    getMessagesWithUsers: async (): Promise<ForumMessage[]> => {
        const data = await apiClient('/api/messages/with-users', { method: 'GET' });
        return Array.isArray(data) ? data.map(normalizeMessage) : [];
    },

    getForumMessages: async (forumId: number): Promise<ForumMessage[]> => {
        const messages = await forumService.getMessagesWithUsers();
        return messages
            .filter((message) => Number(message.forumId) === Number(forumId))
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },

    sendMessage: async (
        forumId: number,
        payload: Pick<ForumMessage, 'content' | 'author' | 'iduser'>,
    ): Promise<ForumMessage> => {
        const data = await apiClient(`/api/messages/${forumId}/messages`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return normalizeMessage(data);
    },

    deleteMessage: async (id: number): Promise<void> => {
        await apiClient(`/api/messages/${id}`, {
            method: 'DELETE',
        });
    },
};
