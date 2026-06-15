import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateContactDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class GetContactsQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
