import { z } from 'zod';
export const adminResourceParams = z.object({ resource: z.enum(['users','mechanics','bookings','emergency','payments','orders','inspections','reviews','used-cars','spare-parts','services','service-categories']) });
