import errorHandler from "errorhandler";
import app from "./app";
import logger from "./utils/logger";
import WebSocket from "ws";
import WSClientMessage from "./utils/WSClientMessage";
import ServerMessenger from "./utils/ServerMessenger";

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
	app.use(errorHandler());
}

/**
 * Start Express server.
 */
export const server = app.listen(app.get("port"), () => {
	logger.info(
		`App is running at http://localhost:${app.get("port")} in ${app.get(
			"env",
		)} mode`,
	);
	logger.info("  Press CTRL-C to stop\n");
});

/**
 * Start Websocket server
 */
export const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
	logger.info(`Websocket Connected`);
	ws.send(ServerMessenger.CONNECTED.toString());

	ws.on("message", (raw: WebSocket.Data) => {
		_onWSMessage(ws, raw);
	});

	ws.on("close", () => {
		_onWSClose(ws);
	});
});

function _onWSMessage(socket: WebSocket, raw: WebSocket.Data) {
	const req = new WSClientMessage(raw.toString());
	if (
		req.req == WSClientMessage.REQ_TYPE.INVALID ||
		req.req == WSClientMessage.REQ_TYPE.BAD_FORMAT
	) {
		console.error(`${req.id}: client message:\n${raw}`);
		socket.send(ServerMessenger.bad_client_msg(raw.toString()).toString());
	} else {
		const resp = this.lobby.handleReq(socket, req);
		socket.send(resp.toString());
	}
}

function _onWSClose(ws: WebSocket) {
	this.lobby.leaveGame(ws);
}
