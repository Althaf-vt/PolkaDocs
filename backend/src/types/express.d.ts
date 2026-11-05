import { RequestUser } from '../common/decorators/current-user.decorator';

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
        }
    }
}