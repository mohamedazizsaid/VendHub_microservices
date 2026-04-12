import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('events')
@Controller('api/events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all events' })
    findAll() {
        return this.eventService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an event by id' })
    findOne(@Param('id') id: string) {
        return this.eventService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an event' })
    update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventService.update(id, updateEventDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an event' })
    remove(@Param('id') id: string) {
        return this.eventService.remove(id);
    }

    @Get(':id/is-participating/:userId')
    @ApiOperation({ summary: 'Check if a user is participating in an event' })
    isParticipating(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ) {
        return this.eventService.isUserInEvent(id, parseInt(userId));
    }

    @Post(':id/register/:userId')
    @ApiOperation({ summary: 'Register a user to an event' })
    register(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ) {
        return this.eventService.register(id, parseInt(userId));
    }

    @Post(':id/unregister/:userId')
    @ApiOperation({ summary: 'Unregister a user from an event' })
    unregister(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ) {
        return this.eventService.unregister(id, parseInt(userId));
    }
}
