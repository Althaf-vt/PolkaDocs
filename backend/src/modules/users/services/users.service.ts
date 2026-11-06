import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AppException } from '../../../common/errors/app.exception';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new AppException(
                'INTERNAL_ERROR',
                'User record not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async create(email: string, passwordHash: string, name?: string): Promise<User> {
        const user = this.userRepository.create({
            email,
            passwordHash,
            name: name ?? null,
        });
        return this.userRepository.save(user);
    }

    async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        if (updateUserDto.name !== undefined) {
            user.name = updateUserDto.name;
        }

        return this.userRepository.save(user);
    }
}