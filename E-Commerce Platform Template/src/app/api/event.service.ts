import { apiClient } from './api-client';

export interface Event {
    id?: string;
    name: string;
    description: string;
    image: string;
    participant: number[];
    capacity: number;
    location: string;
    date: string;
    createdAt?: string;
}

export const eventService = {
    getAllEvents: async (): Promise<Event[]> => {
        return apiClient('/api/events');
    },

    getEventById: async (id: string): Promise<Event> => {
        return apiClient(`/api/events/${id}`);
    },

    createEvent: async (event: Partial<Event>): Promise<Event> => {
        return apiClient('/api/events', {
            method: 'POST',
            body: JSON.stringify(event),
        });
    },

    updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
        return apiClient(`/api/events/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(event),
        });
    },

    deleteEvent: async (id: string): Promise<void> => {
        return apiClient(`/api/events/${id}`, {
            method: 'DELETE',
        });
    },

    isParticipating: async (id: string, userId: string): Promise<boolean> => {
        return apiClient(`/api/events/${id}/is-participating/${userId}`);
    },

    register: async (id: string, userId: string): Promise<Event> => {
        return apiClient(`/api/events/${id}/register/${userId}`, {
            method: 'POST',
        });
    },

    unregister: async (id: string, userId: string): Promise<Event> => {
        return apiClient(`/api/events/${id}/unregister/${userId}`, {
            method: 'POST',
        });
    },
};
