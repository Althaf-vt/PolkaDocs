import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    documentIds?: string[];
}