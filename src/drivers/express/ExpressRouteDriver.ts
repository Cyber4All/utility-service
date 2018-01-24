import * as express from 'express';
import { Router } from 'express';
import * as multer from 'multer';
import * as proxy from 'express-http-proxy';
import { ExpressResponder } from '../drivers';
import { DataStore } from '../../interfaces/interfaces';
import { create, destroy, read, readOne, update, fetchLearningObjects,
         fetchLearningObject, fetchMultipleLearningObject } from '../../interactors/LearningObjectInteractor';
import { LearningObjectRepoFileInteractor } from '../../interactors/LearningObjectRepoFileInteractor';
import { sentry } from '../../logging/sentry';
import { LibraryInteractor } from '../../interactors/LibraryInteractor';

const USERS_API = process.env.USERS_API || 'localhost:3000';

/**
 * Serves as a factory for producing a router for the express app.rt
 *
 * @author Sean Donnelly
 */
export default class ExpressRouteDriver {

  upload = multer({ dest: 'tmp/' });

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(dataStore) {
    let e = new ExpressRouteDriver(dataStore);
    let router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private constructor(public dataStore: DataStore) { console.log(USERS_API); }

  getResponder(res) {
    // TODO: Should this be some sort of factory pattern?
    return new ExpressResponder(res);
  }

  /**
   * Defines the active routes for the API. Routes take an async callback function that contains a request and response object.
   * The callback awaits a particular interactor function that executes the connected business use case.
   *
   * @param router the router being used by the webserver
   */
  setRoutes(router: Router) {
    router.get('/', function (req, res) {
      res.json({ message: 'Welcome to the Bloomin Onion API' });
    });
    router.use('/users', this.buildUserRouter());
    router.use('/users/:username/learning-objects', this.buildUserLearningObjectRouter());
    router.use('/learning-objects', this.buildPublicLearningObjectRouter());
  }

  /**
   * Route handlers for /api/users
   *
   * @returns {Router}
   */
  private buildUserRouter() {
    let router: Router = express.Router();

    // Welcome page
    router.get('', proxy(USERS_API, {
      proxyReqPathResolver: (req) => {
        return '/users';
      },
    }));
    // Register FIXME: /register
    router.post('', proxy(USERS_API, {
      proxyReqPathResolver: (req) => {
        return '/users';
      },
    }));
    // Login FIXME: /authenticate
    router.post('/tokens', proxy(USERS_API, {
      proxyReqPathResolver: (req) => {
        return '/users/tokens';
      },
    }));
    // TODO: Remove account
    router.delete('/:username', proxy(USERS_API, {
      proxyReqPathResolver: (req) => {
        return `/users/${req.params.username}`;
      },
    }));
    router.route('/:username/tokens')
      // Validate Token FIXME: /validateToken
      .post(proxy(USERS_API, {
        proxyReqPathResolver: (req) => {
          return `/users/${req.params.username}/tokens`;
        },
      }))
      // Logout
      .delete(proxy(USERS_API, {
        proxyReqPathResolver: (req) => {
          return `/users/${req.params.username}/tokens`;
        },
      }));
    router.route('/:username/cart')
      .get(async (req, res) => {
        // Get user's cart FIXME: maybe /cart/multiple/:ids ?
        // TODO: Swap ids for username to proxy to cart-service
        await fetchMultipleLearningObject(this.dataStore, this.getResponder(res), ids);

        // TODO remove the route for download=true
        if (req.query['download']) {
          // download is true
          // FIXME: Get ids from cart storage, then send to library checkout
          let ids = req.params.ids.split(',');
          let library = new LibraryInteractor();
          await library.checkout(this.dataStore, this.getResponder(res), ids);
        }
      })
      .delete(async (req, res) => {
        // Clear user's cart
        // TODO pass the username and 
        // await removeFromCart(username, req.body.id)
      });
    router.route('/:username/cart/learning-objects/:author/:learningObjectName')
      .post(async (req, res) => {
        // TODO: Add LO to cart
      })
      .delete(async (req, res) => {
        // TODO: Delete LO from cart
      });

    return router;
  }

  /**
   * Route handlers for /api/users/:username/learning-objects
   *
   * @returns {Router}
   */
  private buildUserLearningObjectRouter() {
    let router: Router = express.Router();
    router.route('')
      .get(async (req, res) => {
        try {
          let responder = this.getResponder(res);
          let user = req['user'];
          await read(this.dataStore, responder, user);
        } catch (e) {
          sentry.logError(e);
        }
      })
      .post(async (req, res) => {
        try {
          let responder = this.getResponder(res);
          let user = req['user'];
          await create(this.dataStore, responder, req.body, user);
        } catch (e) {
          sentry.logError(e);
        }
      })
      .patch(async (req, res) => {
        try {
          let responder = this.getResponder(res);
          let user = req['user'];
          await update(this.dataStore, responder, req.body.id, req.body.learningObject, user);
        } catch (e) {
          sentry.logError(e);
        }
      });
    router.route('/:learningObjectName')
      .get(async (req, res) => {
        try {
          let responder = this.getResponder(res);
          let user = req['user'];
          await readOne(this.dataStore, responder, req.params.learningObjectName, user);
        } catch (e) {
          sentry.logError(e);
        }
      })
      .delete(async (req, res) => {
        try {
          let responder = this.getResponder(res);
          let user = req['user'];
          await destroy(this.dataStore, responder, req.params.id, user);
        } catch (e) {
          sentry.logError(e);
        }
      });
    router.post('/:learningObjectName/files', this.upload.any(), async (req, res) => {
      try {
        let responder = this.getResponder(res);
        let learningObjectFile = new LearningObjectRepoFileInteractor();
        let user = req['user'];
        await learningObjectFile.storeFiles(this.dataStore, responder, req.body.learningObjectID, req['files'], user);
      } catch (e) {
        sentry.logError(e);
      }
    });
    router.delete('/:learningObjectName/files/:filename', async (req, res) => {
      try {
        let responder = this.getResponder(res);
        let learningObjectFile = new LearningObjectRepoFileInteractor();
        let user = req['user'];
        await learningObjectFile.deleteFile(this.dataStore, responder, req.params.id, req.params.filename, user);
      } catch (e) {
        sentry.logError(e);
      }
    });
    return router;
  }

  /**
   * Route handlers for /api/learning-objects
   *
   * @private
   * @returns {Router}
   * @memberof ExpressRouteDriver
   */
  private buildPublicLearningObjectRouter() {
    let router: Router = express.Router();
    router.get('', async (req, res) => {
      try {
        // check for filters and send
        if (req.query) await fetchLearningObjects(this.dataStore, this.getResponder(res), req.query);
        else await fetchLearningObjects(this.dataStore, this.getResponder(res));
      } catch (e) {
        sentry.logError(e);
      }
    });
    router.get('/:author/:learningObjectName', async (req, res) => {
      await fetchLearningObject(this.dataStore, this.getResponder(res), req.params.author, req.params.learningObjectName);
    });
    return router;
  }
}

// /api/users/:username/learning-objects (require auth check for ownership or public viewing)
// /api/learning-objects

// POST /users/tokens          = login
// POST /users                 = register
// POST /users/:username/tokens      = validateToken
// DELETE /users/:username/tokens    = logout
// DELETE /users/:username           = remove account

// GET /users/:username/cart         = get user's cart
// DELETE /users/:username/cart      = clear user's cart
// DELETE /users/:username/cart/learning-objects/:author/:learningObjectName  = delete Learning Object from user's cart
// POST /users/:username/cart/learning-objects/:author/:learningObjectName  = add Learning Object to user's cart
