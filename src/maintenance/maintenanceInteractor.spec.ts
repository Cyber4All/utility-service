let maintenance: any;
describe('get maintenance status', () => {
    beforeAll(async() => {
        jest.doMock('./maintenanceStore', () => ({
            __esModule: true,
            MaintenanceStore: {
              getInstance: () => ({
                getMaintenanceStatus: async () => {
                    return { _id: 'hello', clarkDown: true };
                }
              }),
            },
          }));
        maintenance = await import('./maintenanceInteractor');
    });
    it('should return a boolean to determine if the site is under maintenance', async () => {
        await expect(maintenance.getMaintenanceStatus())
            .resolves.toBe(true);
    });
});




