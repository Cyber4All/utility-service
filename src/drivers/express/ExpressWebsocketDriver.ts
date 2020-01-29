import * as http from 'http';
import * as statusInteractor from '../../status/statusInteractor';
import * as WebSocket from 'ws';
import { OutageReport } from '../../shared/outageReport';

export function setupWebsockets(server: http.Server) {
    
    /**
     * Creates new System Status websocket connections, going to the
     * '/outages' route in the service.  Sends outages back to the
     * client as string data, to be parsed on recieve
     */
    const socket = new WebSocket.Server({ server, path: '/outages' });
    socket.on('connection', async (ws: WebSocket) => {
        statusInteractor.outageReportChange((changes: OutageReport[]) => {
            ws.send(JSON.stringify(changes));
        });
        ws.send(JSON.stringify(await statusInteractor.statusReport()));
    });
}