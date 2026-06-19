export declare class CreateContactDto {
    name: string;
    phone: string;
    tags?: string[];
    city?: string;
    notes?: string;
}
export declare class UpdateContactDto {
    name?: string;
    phone?: string;
    tags?: string[];
    city?: string;
    notes?: string;
}
export declare class GetContactsQueryDto {
    search?: string;
    page?: number;
    limit?: number;
}
