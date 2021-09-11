import errorHandler from "errorhandler";
import app from "./app";
import logger from "./util/logger";
import WebSocket from "ws";
import { WSClientMessage, REQ_TYPE } from "./util/WSClientMessage";
import { SERVER_HEADERS, WSServerMessage } from "./util/WSServerMessage";
import Lobby from "./models/gameplay/Lobby";
import { RegistrationManager } from "./models/registration/RegistrationManager";
import { assert } from "console";

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
	logger.info(`Websocket Connected:`);
	ws.send(new WSServerMessage({ header: SERVER_HEADERS.CONNECTED, at: "" }).toString());
	ws.on("message", (raw: WebSocket.Data) => {
		_onWSMessage(ws, raw);
	});

	ws.on("close", () => {
		_onWSClose(ws);
	});
});

function _onWSMessage(socket: WebSocket, raw: WebSocket.Data) {
	const msg = new WSClientMessage(raw.toString());

	if (msg.isValid()) {
		if (!socket.id) {
			// socket id assigned to client username
			// essentially makes each user have their "own"
			// socket in the eyes of the server
			// TODO: add security where socket must authenticate username with password
			// TODO: check that the user has been registered to a device
			socket.id = msg.id;
		}

		assert(socket.id == msg.id); //FIXME: ADD A BETTER CHECK HERE

		if (
			msg.req == REQ_TYPE.REGISTER ||
			msg.req == REQ_TYPE.CONFIRM_REGISTER
		) {
			const resp = registrar.handleReq(msg);
			socket.send(resp.toString());
		} else {
			const resp = lobby.handleReq(msg);
			socket.send(resp.toString());
		}
	} else {
		console.error(`id:${msg.id}; client message:\n${raw}`);
		socket.send(new WSServerMessage({ header: SERVER_HEADERS.BAD_CLIENT_MSG, at: msg.id, meta: raw.toString() }).toString());
	}


}

function _onWSClose(ws: WebSocket) {
	lobby.leaveGame(ws.id);
}