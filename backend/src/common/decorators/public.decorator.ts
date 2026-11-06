import { SetMetadata, CustomDecorator } from '@nestjs/common';

// Metadata key used by JwtAuthGuard to identify unauthenticated routes
export const IS_PUBLIC_KEY = 'isPublic';

// Decorator marking route handlers as public
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);