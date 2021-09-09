import errorHandler from "errorhandler";
import app from "./app";
import logger from "./util/logger";
import WebSocket from "ws";
import { WSClientMessage, REQ_TYPE } from "./util/WSClientMessage";
import ServerMessenger from "./util/ServerMessenger";
import Lobby from "./models/gameplay/Lobby";
import { RegistrationManager } from "./models/registration/RegistrationManager";

const lobby = new Lobby();
const registrar = new RegistrationManager();

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
	app.use(errorHandler());
}


/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
	logger.info(
		`App is running at http://localhost:${app.get("port")} in ${app.get("env")} mode`
	);
	logger.info("  Press CTRL-C to stop\n");
});

export default server;

/**
 * Start Websocket server
 */
export const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
	logger.info("Websocket Connected");
	ws.send(ServerMessenger.CONNECTED.toString());
	ws.on("message", (raw: WebSocket.Data) => {
		_onWSMessage(ws, raw);

	});

	ws.on("close", () => {
		_onWSClose(ws);
	});
});

function _onWSMessage(socket: WebSocket, raw: WebSocket.Data) {
	const msg = new WSClientMessage(raw.toString());
	if (
		msg.req == REQ_TYPE.INVALID ||
		msg.req == REQ_TYPE.BAD_FORMAT
	) {
		console.error(`${msg.id}: client message:\n${raw}`);
		socket.send(ServerMessenger.bad_client_msg(raw.toString()).toString());
	} else if (
		msg.req == REQ_TYPE.REGISTER ||
		msg.req == REQ_TYPE.CONFIRM_REGISTER
	) {
		const resp = registrar.handleReq(msg);
		socket.send(resp.toString());
	} else {
		const resp = lobby.handleReq(socket, msg);
		socket.send(resp.toString());
	}
}

function _onWSClose(ws: WebSocket) {
	lobby.leaveGame(ws);
}