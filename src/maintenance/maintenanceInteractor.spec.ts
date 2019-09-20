import * as maintenance from './maintenanceInteractor';
import { }

describe('get maintenance status', () => {
    it('should return a boolean to determine if the site is under maintenance', async () => {
        const clarkDown = await maintenance.getMaintenanceStatus();
        expect(clarkDown).resolves.toBeDefined();
    });
});




