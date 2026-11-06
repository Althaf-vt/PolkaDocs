import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Authenticated user payload attached to the request by JwtAuthGuard
export interface RequestUser {
    id: string;
    email: string;
}

// Parameter decorator extracting the authenticated user or a specific property
export const CurrentUser = createParamDecorator(
    (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string | null => {
        const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
        const user = request.user;

        if (!user) {
            return null;
        }

        return data ? user[data] : user;
    },
);