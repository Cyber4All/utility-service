import { Router } from 'express';
import * as interactor from '../../maintenance/maintenanceInteractor';
import { mapErrorToResponseData } from '../../shared/errors';
import { UserToken } from '../../shared/user-token';
import * as userInterractor from '../../users/userInteractor';

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
          const user: UserToken = req.user;
          interactor.setAuthorization(user);
          await interactor.setMaintenanceStatus(val);
          res.sendStatus(204);
        } catch (e) {
            const code = mapErrorToResponseData(e);
            res.sendStatus(code);
        }
      });

    router.get('/utility-users', async(req, res) => {
        const users = await userInterractor.getUsers();
        res.send(users);
      });
    }
}
