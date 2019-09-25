import * as express from 'express';
import { Router } from 'express';
import 'dotenv/config';
import fetch from 'node-fetch';
import { ServerlessCache } from '../../cache';
import * as interactor from '../../maintenance/maintenanceInteractor';
/**
 * Serves as a factory for producing a router for the express app.rt
 *
 * @author Sean Donnelly
 */

export default class ExpressRouteDriver {
  /**
   * Produces a configured express router
   */
  public static buildRouter() {
    let e = new ExpressRouteDriver();
    let router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private constructor() {}

  /**
   * Defines the active routes for the API. Routes take an async callback function that contains a request and response object.
   * The callback awaits a particular interactor function that executes the connected business use case.
   *
   * @param router the router being used by the webserver
   */
  setRoutes(router: Router) {

    router.get('/', async(req, res) => {
      res.send('CLARK Utility Service running on localhost:9000');
    });

    // APP STATUS
    router.get('/status', async (req, res) => {
      res.send(ServerlessCache.cachedValue);
    });

    // CLARK MAINTENANCE NOTIFICATION
    router.get('/maintenance', async(req, res) => {
      const mango = await interactor.getMaintenanceStatus();
      res.send(mango);
    });

    // SET CLARK MAINTENANCE NOTIFICATION
    router.post('/maintenance', async(req, res) => {
      try {
        const val = req.body.clarkDown;
        const user = req.user;
        if (user.accessGroups !== undefined && user.accessGroups.includes('admin')) {
          await interactor.setMaintenanceStatus(val);
          res.status(200).send('Maintenance page toggled.');
        } else {
          res.status(401).send('You do not have the authority to toggle the maintenance page.');
        }
      } catch (e) {
        res.status(500).send('Could not toggle down page.');
      }
    });

    // VERSION CHECK
    router.get('/clientversion/:clientVersion', async (req, res) => {
      try {
        const response = await fetch(process.env.CLIENTVERSIONURL);
        const object = await response.json();
        const version: string = object.version;
        if (req.params.clientVersion === version) {
          res.sendStatus(200);
        } else {
          // Http 426 - Upgrade Required
          res
            .status(426)
            .send(
              'A new version of CLARK is available! . Refresh your page to see our latest changes.',
            );
        }
      } catch (e) {
        res.status(500).send('Could not recover the client version');
      }
    });
  }
}
