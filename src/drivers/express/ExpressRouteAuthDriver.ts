import { Router } from 'express';
import * as interactor from '../../maintenance/maintenanceInteractor';

export class ExpressRouteAuthDriver {
    public static buildRouter(): Router {
      const e = new ExpressRouteAuthDriver();
      const router: Router = Router();
      e.setRoutes(router);
      return router;
    }

    private setRoutes(router: Router): void {
    // SET CLARK MAINTENANCE NOTIFICATION
    router.post('/maintenance', async(req, res) => {
        try {
          const val = req.body.clarkDown;
          const user = req.user;
          if (user.accessGroups !== undefined && user.accessGroups.includes('admin')) {
            // await interactor.setMaintenanceStatus(val);
            res.status(200).send('Maintenance page toggled.');
          } else if (user.accessGroups === undefined || !user.accessGroups.includes('admin')) {
            res.status(401).send('You do not have the authority to toggle the maintenance page.');
          }
        } catch (e) {
          console.log('error', e);
          res.status(500).send('Could not toggle down page.');
        }
      });
    }
}