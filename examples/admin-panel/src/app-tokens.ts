import { createToken } from '@ariana/core';
import type { Token } from '@ariana/core';
import type { QueryClient } from '@ariana/query';

export const ADMIN_QUERY_CLIENT: Token<QueryClient> = createToken<QueryClient>('admin.queryClient');
