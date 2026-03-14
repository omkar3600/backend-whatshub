import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    async createContact(@GetUser() user: any, @Body() body: any) {
        return this.contactsService.createContact(user.shopId, body);
    }

    @Get()
    async getContacts(@GetUser() user: any, @Query() query: any) {
        return this.contactsService.getContacts(user.shopId, query);
    }

    @Get(':id')
    async getContact(@GetUser() user: any, @Param('id') id: string) {
        return this.contactsService.getContact(user.shopId, id);
    }

    @Put(':id')
    async updateContact(@GetUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.contactsService.updateContact(user.shopId, id, body);
    }

    @Delete(':id')
    async deleteContact(@GetUser() user: any, @Param('id') id: string) {
        return this.contactsService.deleteContact(user.shopId, id);
    }
}
