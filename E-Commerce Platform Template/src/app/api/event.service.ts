import { apiClient } from './api-client';

export interface Event {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    image: string;
    participant: string[];
    capacity: number;
    location: string;
    date: string;
    createdAt?: string;
}

const normalizeEvent = (event: any): Event => {
    return {
        ...event,
        id: event?.id || event?._id,
        _id: event?._id || event?.id,
        participant: Array.isArray(event?.participant)
            ? event.participant.map((entry: string | number) => String(entry))
            : [],
        capacity: typeof event?.capacity === 'number' ? event.capacity : 0,
    };
};

export const eventService = {
    getAllEvents: async (): Promise<Event[]> => {
        const events = await apiClient('/api/events');
        return Array.isArray(events) ? events.map(normalizeEvent) : [];
    },

    getEventById: async (id: string): Promise<Event> => {
        const event = await apiClient(`/api/events/${id}`);
        return normalizeEvent(event);
    },

    createEvent: async (event: Partial<Event>): Promise<Event> => {
        const created = await apiClient('/api/events', {
            method: 'POST',
            body: JSON.stringify(event),
        });
        return normalizeEvent(created);
    },

    updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
        const updated = await apiClient(`/api/events/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(event),
        });
        return normalizeEvent(updated);
    },

    deleteEvent: async (id: string): Promise<void> => {
        return apiClient(`/api/events/${id}`, {
            method: 'DELETE',
        });
    },

    uploadEventImage: async (file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient('/api/events/upload-image', {
            method: 'POST',
            body: formData,
        });
    },

    isParticipating: async (id: string, userId: string): Promise<boolean> => {
        return apiClient(`/api/events/${id}/is-participating/${userId}`);
    },

    register: async (id: string, userId: string): Promise<Event> => {
        const updated = await apiClient(`/api/events/${id}/register/${userId}`, {
            method: 'POST',
        });
        return normalizeEvent(updated);
    },

    unregister: async (id: string, userId: string): Promise<Event> => {
        const updated = await apiClient(`/api/events/${id}/unregister/${userId}`, {
            method: 'POST',
        });
        return normalizeEvent(updated);
    },
};
