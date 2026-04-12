import { IsString, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({ type: [Number], default: [] })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    participant?: number[];

    @ApiProperty()
    @IsNumber()
    capacity: number;

    @ApiProperty()
    @IsString()
    location: string;

    @ApiProperty()
    @IsDateString()
    date: string;
}
