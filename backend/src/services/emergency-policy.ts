import { BadRequestError, ForbiddenError } from '../errors/app-error';
import { EmergencyStatus, UserRole } from '../types';

export interface EmergencyActor { id: string; role: UserRole }
export function emergencyScope(actor: EmergencyActor, action: 'read' | 'update' | 'cancel'): Record<string, unknown> {
  if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) return {};
  if (actor.role === UserRole.CUSTOMER && action !== 'update') return { customerId: actor.id };
  if (actor.role === UserRole.MECHANIC && action !== 'cancel') return { assignedProviderId: actor.id };
  throw new ForbiddenError('You cannot perform this action on an emergency request');
}
const transitions: Partial<Record<EmergencyStatus, EmergencyStatus[]>> = {
  PENDING: [EmergencyStatus.SEARCHING, EmergencyStatus.ASSIGNED, EmergencyStatus.CANCELLED, EmergencyStatus.EXPIRED],
  SEARCHING: [EmergencyStatus.ASSIGNED, EmergencyStatus.CANCELLED, EmergencyStatus.EXPIRED],
  ASSIGNED: [EmergencyStatus.ACCEPTED, EmergencyStatus.CANCELLED, EmergencyStatus.REJECTED],
  ACCEPTED: [EmergencyStatus.EN_ROUTE, EmergencyStatus.CANCELLED],
  EN_ROUTE: [EmergencyStatus.ARRIVED, EmergencyStatus.CANCELLED, EmergencyStatus.FAILED],
  ARRIVED: [EmergencyStatus.IN_PROGRESS, EmergencyStatus.CANCELLED, EmergencyStatus.FAILED],
  IN_PROGRESS: [EmergencyStatus.COMPLETED, EmergencyStatus.FAILED],
};
export function assertEmergencyTransition(current: EmergencyStatus, next: EmergencyStatus): void {
  if (!transitions[current]?.includes(next)) throw new BadRequestError(`Invalid emergency transition from '${current}' to '${next}'`);
}
