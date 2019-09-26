import { UserToken } from '../shared/user-token';
import { ResourceError, ResourceErrorReason } from '../errors';

const AUTHORIZEDMOCKUSER: UserToken = {
    'username': 'tester',
    'name': 'test the master',
    'email': 'test@test.com',
    'organization' : 'test',
    'emailVerified': true,
    'accessGroups': ['admin'],
};
const MOCKUSER: UserToken = {
    'username': 'tester',
    'name': 'test the master',
    'email': 'test@test.com',
    'organization' : 'test',
    'emailVerified': true,
    'accessGroups': ['reviewer'],
}
let maintenance: any;
describe('get maintenance status', () => {
    beforeAll(async() => {
        jest.doMock('./maintenanceStore', () => ({
            __esModule: true,
            MaintenanceStore: {
              getInstance: () => ({
                getMaintenanceStatus: async () => {
                    return true;
                },
              }),
            },
          }));
        maintenance = await import('./maintenanceInteractor');
    });
    it('should return a boolean to determine if the site is under maintenance', async () => {
        await expect(maintenance.getMaintenanceStatus())
            .resolves.toBe(true);
    });
    it('should return undefined because the user is an admin', () => {
      expect(maintenance.setAuthorization(AUTHORIZEDMOCKUSER)).toBeUndefined();
    });
    it('should throw an error because the user is not an admin', () => {
      expect(() => {
        maintenance.setAuthorization(MOCKUSER);
      },
        ).toThrow(
          new ResourceError(
            'Invalid access',
            ResourceErrorReason.INVALID_ACCESS,
          ),
        );
    });
});




