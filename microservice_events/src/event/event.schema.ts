import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
    
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    image: string;

    @Prop({ type: [String], default: [] })
    participant: string[]; // List of user IDs

    @Prop()
    capacity: number;

    @Prop()
    location: string;

    @Prop()
    date: Date;

    @Prop({ default: () => new Date() })
    createdAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
