import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, MaxLength } from "class-validator";
export class CreateRoomDto {
    
    @ApiProperty({
        description: "Room name",
        example: "Deluxe Room"
    })
    @IsString( {
        message: "name must be a string"
    })
    @IsNotEmpty({
        message: "name should not be empty"
    })
    @MaxLength(100, {
        message: "name must be shorter than or equal to 100 characters"
    })
    name!: string;

    @ApiPropertyOptional({
        description: 'The description of room',
        example: 'The biggest room which is available up to 6 people per room.'
    })
    @IsString({
        message: "description must be a string"
    })
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The number of people that the room is available for',
        example: 3
    })
    @IsNumber()
    @IsNotEmpty()
    capacity!: number;

    @ApiProperty({
        description: 'The room\'s price per night',
        example: 18.00
    })
    @IsNumber()
    @IsNotEmpty()
    price_per_night!: number;

    @ApiPropertyOptional({
        description: 'The image url for displaying the example of the room.',
        example: 'http://localhost:8080/example/image.jpg'
    })
    @IsString({
        message: "image_url must be boolean"
    })
    @IsOptional()
    image_url?: string;
    
    @ApiPropertyOptional({
        description: 'The status of room whether it is active.',
        example: true
    })
    @IsBoolean({
        message: "is_active must be boolean"
    })
    @IsOptional()
    is_active?: boolean = true;
}
