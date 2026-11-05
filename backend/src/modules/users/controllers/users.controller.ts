import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@CurrentUser('id') userId: string) {
        const user = await this.usersService.findById(userId);
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const updated = await this.usersService.updateProfile(userId, updateUserDto);
        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            updatedAt: updated.updatedAt,
        };
    }
}