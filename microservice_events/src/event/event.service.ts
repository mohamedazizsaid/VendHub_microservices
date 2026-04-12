import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    async create(createEventDto: CreateEventDto): Promise<Event> {
        const createdEvent = new this.eventModel(createEventDto);
        return createdEvent.save();
    }

    async findAll(): Promise<Event[]> {
        return this.eventModel.find().exec();
    }

    async findOne(id: string): Promise<Event> {
        const event = await this.eventModel.findById(id).exec();
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
        const updatedEvent = await this.eventModel
            .findByIdAndUpdate(id, updateEventDto, { new: true })
            .exec();
        if (!updatedEvent) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return updatedEvent;
    }

    async remove(id: string): Promise<any> {
        const result = await this.eventModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return result;
    }

    async isUserInEvent(id: string, userId: string): Promise<boolean> {
        if (!userId || !userId.trim()) {
            throw new BadRequestException('User ID is required');
        }

        const normalizedUserId = userId.trim();
        const event = await this.findOne(id);
        return event.participant.includes(normalizedUserId);
    }

    async register(id: string, userId: string): Promise<Event> {
        if (!userId || !userId.trim()) {
            throw new BadRequestException('User ID is required');
        }

        const normalizedUserId = userId.trim();
        const event = await this.findOne(id);

        if (event.participant.includes(normalizedUserId)) {
            return event; // Already registered
        }

        if (event.capacity && event.participant.length >= event.capacity) {
            throw new ConflictException('Event is at full capacity');
        }

        return this.eventModel
            .findByIdAndUpdate(
                id,
                { $addToSet: { participant: normalizedUserId } },
                { new: true },
            )
            .exec()
            .then((event) => {
                if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
                return event;
            });
    }

    async unregister(id: string, userId: string): Promise<Event> {
        if (!userId || !userId.trim()) {
            throw new BadRequestException('User ID is required');
        }

        const normalizedUserId = userId.trim();
        return this.eventModel
            .findByIdAndUpdate(
                id,
                { $pull: { participant: normalizedUserId } },
                { new: true },
            )
            .exec()
            .then((event) => {
                if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
                return event;
            });
    }
}
