import { authService } from '../src/services/auth.service';
import { User } from '../src/models/user.model';
import { UserRole } from '../src/types';
jest.mock('../src/models/user.model');
const user = { _id: '507f1f77bcf86cd799439011', email: 'mechanic@example.test', role: UserRole.MECHANIC, isActive: true };
test('logging out the last session does not make its refresh token valid again', async () => {
  const token = authService.generateRefreshToken(user);
  (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ ...user, refreshTokens: [] }) });
  await expect(authService.refreshToken(token)).rejects.toThrow(/revoked/);
});
test('refresh requires explicit membership in the users active sessions', async () => {
  const token = authService.generateRefreshToken(user);
  (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ ...user, refreshTokens: [token] }) });
  expect((await authService.refreshToken(token)).accessToken).toEqual(expect.any(String));
});
