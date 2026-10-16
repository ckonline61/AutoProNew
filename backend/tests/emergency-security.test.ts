import { EmergencyService } from '../src/services/emergency.service';
import { EmergencyRequest } from '../src/models/emergency-request.model';
import { Mechanic } from '../src/models/mechanic.model';
import { Vehicle } from '../src/models/vehicle.model';
import { User } from '../src/models/user.model';
import { assertEmergencyTransition, emergencyScope } from '../src/services/emergency-policy';
import { EmergencyStatus as S, UserRole, EmergencyType, Priority } from '../src/types';
jest.mock('../src/models/emergency-request.model');
jest.mock('../src/models/mechanic.model');
jest.mock('../src/models/vehicle.model', () => ({ Vehicle: { exists: jest.fn() } }));
jest.mock('../src/models/user.model');
const service = new EmergencyService();
const actor = { id: '507f1f77bcf86cd799439011', role: UserRole.MECHANIC };
const requestId = '507f1f77bcf86cd799439022';
beforeEach(() => jest.resetAllMocks());
test('customers cannot progress requests; read/cancel and provider operations are ownership scoped', () => {
  const customer = { ...actor, role: UserRole.CUSTOMER };
  expect(emergencyScope(customer, 'read')).toEqual({ customerId: actor.id });
  expect(emergencyScope(customer, 'cancel')).toEqual({ customerId: actor.id });
  expect(() => emergencyScope(customer, 'update')).toThrow();
  expect(emergencyScope(actor, 'update')).toEqual({ assignedProviderId: actor.id });
  expect(() => emergencyScope(actor, 'cancel')).toThrow();
});
test('unrelated customer cannot read another emergency', async () => {
  const query = { populate: jest.fn().mockReturnThis(), then: (resolve: (value: null) => unknown) => Promise.resolve(null).then(resolve) };
  (EmergencyRequest.findOne as jest.Mock).mockReturnValue(query);
  await expect(service.getById(requestId, { ...actor, role: UserRole.CUSTOMER })).rejects.toThrow(/not found/);
  expect(EmergencyRequest.findOne).toHaveBeenCalledWith({ _id: requestId, customerId: actor.id, isActive: true });
});
test('a provider cannot change another providers assignment', async () => {
  (EmergencyRequest.findOne as jest.Mock).mockResolvedValue(null);
  await expect(service.updateStatus(requestId, S.EN_ROUTE, undefined, actor)).rejects.toThrow(/not found/);
  expect(EmergencyRequest.findOne).toHaveBeenCalledWith({ _id: requestId, assignedProviderId: actor.id, isActive: true });
  expect(EmergencyRequest.findOneAndUpdate).not.toHaveBeenCalled();
});
test('out of order progress and terminal resurrection are rejected', () => {
  expect(() => assertEmergencyTransition(S.ACCEPTED, S.EN_ROUTE)).not.toThrow();
  for (const current of [S.ASSIGNED, S.ACCEPTED, S.COMPLETED, S.CANCELLED, S.FAILED, S.EXPIRED]) expect(() => assertEmergencyTransition(current, S.COMPLETED)).toThrow();
  expect(() => assertEmergencyTransition(S.IN_PROGRESS, S.CANCELLED)).toThrow();
});
test('concurrent cancellation/status changes are rejected without overwriting the winner', async () => {
  (EmergencyRequest.findOne as jest.Mock).mockResolvedValue({ status: S.ACCEPTED });
  (EmergencyRequest.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
  await expect(service.updateStatus(requestId, S.EN_ROUTE, 'Starting', actor)).rejects.toThrow(/changed/);
  expect(EmergencyRequest.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: S.ACCEPTED, assignedProviderId: actor.id }), expect.any(Object), expect.any(Object));
});
test('unapproved or offline providers cannot accept emergencies', async () => {
  (Mechanic.exists as jest.Mock).mockResolvedValue(null);
  await expect(service.acceptRequest(actor.id, requestId)).rejects.toThrow(/approved and online/);
  expect(EmergencyRequest.findOne).not.toHaveBeenCalled();
});
test('SOS cannot attach another customers vehicle', async () => {
  (Vehicle.exists as jest.Mock).mockResolvedValue(null);
  await expect(service.createSOS(actor.id, { vehicleId: requestId, problemType: EmergencyType.BREAKDOWN, latitude: 10, longitude: 20, priority: Priority.HIGH })).rejects.toThrow(/Vehicle/);
  expect(EmergencyRequest.create).not.toHaveBeenCalled();
});
test('dispatch requires an administrator and an available verified provider', async () => {
  await expect(service.assignProvider(requestId, actor.id, actor)).rejects.toThrow(/Administrator/);
  (Mechanic.exists as jest.Mock).mockResolvedValue(null);
  (User.exists as jest.Mock).mockResolvedValue({ _id: actor.id });
  await expect(service.assignProvider(requestId, actor.id, { ...actor, role: UserRole.ADMIN })).rejects.toThrow(/available mechanic/);
  expect(EmergencyRequest.findOneAndUpdate).not.toHaveBeenCalled();
});
test('dispatch never overwrites an already accepted emergency', async () => {
  (Mechanic.exists as jest.Mock).mockResolvedValue({ _id: actor.id });
  (User.exists as jest.Mock).mockResolvedValue({ _id: actor.id });
  (EmergencyRequest.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
  await expect(service.assignProvider(requestId, actor.id, { ...actor, role: UserRole.ADMIN })).rejects.toThrow(/already accepted/);
  expect(EmergencyRequest.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: { $in: [S.PENDING, S.SEARCHING, S.REJECTED, S.ASSIGNED] } }), expect.any(Object), expect.any(Object));
});
