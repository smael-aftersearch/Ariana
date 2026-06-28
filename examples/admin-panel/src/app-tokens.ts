import { createToken } from '@ariana/core';
import type { QueryClient } from '@ariana/query';

export const ADMIN_QUERY_CLIENT = createToken<QueryClient>('admin.queryClient');
