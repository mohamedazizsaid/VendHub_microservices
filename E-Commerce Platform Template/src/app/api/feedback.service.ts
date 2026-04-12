import { apiClient } from './api-client';

export interface Feedback {
    id: number;
    eventId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
}

const normalizeFeedback = (feedback: any): Feedback => ({
    id: Number(feedback?.id || 0),
    eventId: String(feedback?.eventId || ''),
    userId: String(feedback?.userId || ''),
    rating: Number(feedback?.rating || 0),
    comment: String(feedback?.comment || ''),
    createdAt: feedback?.createdAt,
    updatedAt: feedback?.updatedAt,
});

interface FeedbackPayload {
    eventId: string;
    userId: number;
    rating: number;
    comment: string;
}

export const feedbackService = {
    getFeedbacksByEventId: async (eventId: string): Promise<Feedback[]> => {
        const response = await apiClient(`/api/feedbacks/event/${eventId}`, {
            method: 'GET',
        });
        return Array.isArray(response) ? response.map(normalizeFeedback) : [];
    },

    deleteFeedback: async (feedbackId: number): Promise<void> => {
        await apiClient(`/api/feedbacks/${feedbackId}`, {
            method: 'DELETE',
        });
    },

    createFeedback: async (payload: FeedbackPayload): Promise<Feedback> => {
        const created = await apiClient('/api/feedbacks', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return normalizeFeedback(created);
    },

    updateFeedback: async (feedbackId: number, payload: FeedbackPayload): Promise<Feedback> => {
        const updated = await apiClient(`/api/feedbacks/${feedbackId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return normalizeFeedback(updated);
    },
};
