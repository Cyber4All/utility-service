import { Router } from 'express';
import * as interactor from '../../maintenance/maintenanceInteractor';
import { mapErrorToResponseData } from '../../shared/errors';

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
            await interactor.setMaintenanceStatus(val);
            res.sendStatus(204);
          } else {
            res.sendStatus(401);
          }
        } catch (e) {
            const code = mapErrorToResponseData(e);
            res.status(code);
        }
      });
    }
}
