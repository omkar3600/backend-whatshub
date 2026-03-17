import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    createContact(user: any, body: any): Promise<any>;
    getContacts(user: any, query: any): Promise<any>;
    getContact(user: any, id: string): Promise<any>;
    updateContact(user: any, id: string, body: any): Promise<any>;
    deleteContact(user: any, id: string): Promise<any>;
}
