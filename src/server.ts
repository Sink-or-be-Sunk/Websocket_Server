import errorHandler from "errorhandler";
import app from "./app";
import logger from "./util/logger";
import WebSocket from "ws";
import { WSClientMessage, REQ_TYPE } from "./util/WSClientMessage";
import { SERVER_HEADERS, WSServerMessage } from "./util/WSServerMessage";
import Lobby from "./models/gameplay/Lobby";
import { RegistrationManager } from "./models/registration/RegistrationManager";
import { DBManager } from "./models/database/DBManager";

const connections = new Map<string, WebSocket>();
const timeouts = new Map<string, NodeJS.Timeout>();

const lobby = new Lobby();
const registrar = new RegistrationManager();
const dbManager = new DBManager();

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
		`App is running at http://localhost:${app.get("port")} in ${app.get(
			"env",
		)} mode`,
	);
	logger.info("  Press CTRL-C to stop\n");
});

export default server;

/**
 * Start Websocket server
 */
export const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
	logger.info("Websocket Connected:");
	ws.send(
		new WSServerMessage({
			header: SERVER_HEADERS.CONNECTED,
			at: "",
		}).toString(),
	);
	ws.on("message", async (raw: WebSocket.Data) => {
		_onWSMessage(ws, raw);
	});

	ws.on("close", () => {
		_onWSClose(ws);
	});

	ws.on("error", (err: Error) => {
		logger.error("Websocket Error!");
		logger.error(err);
	});
});

wss.on("error", (err: Error) => {
	logger.error("Websocket SERVER Error!");
	logger.error(err);
});

async function _onWSMessage(socket: WebSocket, raw: WebSocket.Data) {
	const msg = new WSClientMessage(raw.toString());

	if (msg.isValid()) {
		if (!socket.id) {
			// socket id assigned to client username
			// essentially makes each user have their "own"
			// socket in the eyes of the server
			// TODO: add security where socket must authenticate username with password
			// TODO: check that the user has been registered to a device
			if (msg.id) {
				socket.id = msg.id;
				socket.dropped = 0;
				connections.set(socket.id, socket);
				logger.info(`New Socket Added: <${socket.id}>`);
			} else {
				logger.error("msg received without id!");
				return;
			}
		}

		logger.debug(`reset dropped for ${socket.id}`);
		socket.dropped = 0;

		if (socket.id != msg.id) {
			logger.error(
				`Ignoring message where socket id <${socket.id}> differs from msg id <${msg.id}>`,
			);
			sendList([
				new WSServerMessage({
					header: SERVER_HEADERS.BAD_CLIENT_MSG,
					at: socket.id,
					meta: `ID Mismatch ${socket.id}, ${msg.id}`,
				}),
			]);
			return;
		}

		if (msg.req == REQ_TYPE.CONNECTED) {
			// logger.debug(`Device connected: ${msg.id}`);
			// DO NOTHING BUT DON'T REMOVE, NEEDED TO AVOID INTERNAL SERVER ERROR MESSAGE
		} else if (dbManager.handles(msg.req)) {
			const list = await dbManager.handleReq(msg);
			sendList(list);
		} else if (lobby.handles(msg.req)) {
			const list = await lobby.handleReq(msg);
			sendList(list);
		} else if (registrar.handles(msg.req)) {
			const list = await registrar.handleReq(msg);
			sendList(list);
		} else {
			logger.error(msg);
			socket.send(
				new WSServerMessage({
					header: SERVER_HEADERS.BAD_CLIENT_MSG,
					at: msg.id,
					meta: "SERVER INTERNAL ERROR: " + raw.toString(),
				}).toString(),
			);
		}
	} else {
		logger.error(`id:${msg.id}; client message:\n${raw}`);
		socket.send(
			new WSServerMessage({
				header: SERVER_HEADERS.BAD_CLIENT_MSG,
				at: msg.id,
				meta: raw.toString(),
			}).toString(),
		);
	}
}

function _onWSClose(ws: WebSocket) {
	logger.warn(`Connection <${ws.id}> closed`);

	// logger.warn(`Connection <${ws.id}> timeout occurred`);
	// lobby.leaveGame(ws.id);

	// ws.send(JSON.stringify({ header: "RECONNECT" }));

	// if (timeouts.has(ws.id)) {
	// 	clearTimeout(timeouts.get(ws.id));
	// }

	// timeouts.set(
	// 	ws.id,
	// 	setTimeout(() => {
	// 	}, 5000),
	// ); //30 second timeout for stale MCU websocket
}

function sendList(list: WSServerMessage[]) {
	for (let i = 0; i < list.length; i++) {
		const msg = list[i];
		const socket = connections.get(msg.at);
		if (socket) {
			socket.send(msg.toString());
		} else {
			logger.error(`socket not found: ${msg.at}`);
		}
	}
}

/** Check Connections at 1Hz to determine if connection has timed out */
setInterval(() => {
	// logger.debug(`Number of Connections: ${connections.size}`);
	for (const [id, connection] of connections) {
		// logger.debug(`<${id}> has dropped <${connection.dropped}>`);
		if (connection.dropped > 30) {
			logger.error(`Connection to <${id}> timed out!`);
			lobby.leaveGame(id); // This does nothing when player isn't apart of any game
			connections.delete(id);
		}
		connection.dropped++;
	}
}, 1000);
