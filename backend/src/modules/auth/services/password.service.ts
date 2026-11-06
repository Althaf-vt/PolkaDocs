import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordService {
    private readonly saltRounds = 10;
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }
    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}