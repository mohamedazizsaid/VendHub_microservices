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

    @ApiProperty({ type: [String], default: [] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participant?: string[];

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
