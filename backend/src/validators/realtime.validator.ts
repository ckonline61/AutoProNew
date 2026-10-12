import { z } from 'zod';
import { latitudeSchema, longitudeSchema, objectIdSchema } from './common';

export const publishLocationSchema = z.object({
  jobType: z.enum(['BOOKING', 'EMERGENCY']),
  jobId: objectIdSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  heading: z.number().min(0).max(360).optional().default(0),
  speed: z.number().min(0).optional().default(0),
});

export const joinRoomSchema = z.object({
  jobType: z.enum(['BOOKING', 'EMERGENCY']),
  jobId: objectIdSchema,
});

export type PublishLocationInput = z.infer<typeof publishLocationSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
