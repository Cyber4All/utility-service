import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as http from 'http';
import { ExpressRouteDriver } from '../drivers';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { sentryRequestHandler, sentryErrorHandler } from '../../shared/SentryConnector';
import { enforceAuthenticatedAccess, handleProcessTokenError, processToken } from '../../middleware';
import * as cookieParser from 'cookie-parser';
import { ExpressRouteAuthDriver } from '../drivers';
import * as statusInteractor from '../../status/statusInteractor';
import * as WebSocket from 'ws';
import { OutageReport } from '../../shared/outageReport';

dotenv.config();

const KEEP_ALIVE_TIMEOUT = process.env.KEEP_ALIVE_TIMEOUT;

/**
 * Handles serving the API through the express framework.
 */
export class ExpressDriver {
  static app = express();
  static connectedClients = new Map<string, string>();

  static start() {
    if (process.env.NODE_ENV === 'production') {
      // Configure error handler - MUST BE THE FIRST ERROR HANDLER IN CALL ORDER
      this.app.use(sentryErrorHandler);

      // Configure Sentry Route Handler - MUST BE FIRST ROUTE HANDLER
      this.app.use(sentryRequestHandler);
    }

    // Configure app to log requests
    this.app.use(logger('combined'));

    // configure app to use bodyParser()
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
    this.app.use(bodyParser.json());

    this.app.use(cors({ origin: true, credentials: true }));
    this.app.set('trust proxy', true);
    this.app.use(cookieParser());

    // Set our public api routes
    this.app.use('/', ExpressRouteDriver.buildRouter());

    this.app.use(enforceAuthenticatedAccess);

    // Set our authenticated api routes
    this.app.use(ExpressRouteAuthDriver.buildRouter());

    /**
     * Get port from environment and store in Express.
     */
    const port = process.env.PORT || '9000';
    this.app.set('port', port);

    /**
     * Create HTTP server.
     */
    const server = http.createServer(this.app);
    server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT
      ? parseInt(KEEP_ALIVE_TIMEOUT, 10)
      : server.keepAliveTimeout;

    // SYSTEM STATUS WEBSOCKET
    const socket = new WebSocket.Server({ server, path: '/outages' });
    socket.on('connection', (ws: WebSocket) => {
      statusInteractor.outageReportChange((changes: OutageReport[]) => {
        ws.send(JSON.stringify(changes));
      });
    });

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port, () =>
      console.log(`CLARK Utility Service running on localhost:${port}`),
    );

    return this.app;
  }

}
