if (process.env.NODE_ENV !== "production") require("dotenv").config();
import * as http from "http";
import WebSocket from "ws";
import Lobby from "./Lobby";
import WSClientMessage from "./WSClientMessage";
import ServerMessenger from "./ServerMessenger";

import events from "events"; //FIXME: REMOVE WHEN REMOVING LOGGING

export default class ServerManager {
	private lobby: Lobby;
	port: number | string;
	server: http.Server;
	wss: WebSocket.Server;

	constructor(app: Express.Application) {
		this.lobby = new Lobby();

		this.port = process.env.PORT || 8080;

		// initialize a simple http server
		const server = http.createServer(app);
		this.server = server;

		// initialize the WebSocket server instance
		this.wss = new WebSocket.Server({ server });

		this._createLoggerSocket(); //FIXME: REMOVE
	}

	start() {
		this.wss.on("connection", (ws: WebSocket) => {
			this._onWSConnection(ws);
		});

		// start server
		this.server.listen(this.port, () => {
			console.log(`Server started at http://localhost:${this.port}/`);
		});
	}

	private _onWSConnection(ws: WebSocket) {
		console.log(`Websocket Connected`);
		ws.send(ServerMessenger.CONNECTED.toString());

		ws.on("message", (raw: WebSocket.Data) => {
			this._onWSMessage(ws, raw);
		});

		ws.on("close", () => {
			this._onWSClose(ws);
		});
	}

	private _onWSMessage(socket: WebSocket, raw: WebSocket.Data) {
		const req = new WSClientMessage(raw.toString());
		if (
			req.req == WSClientMessage.REQ_TYPE.INVALID ||
			req.req == WSClientMessage.REQ_TYPE.BAD_FORMAT
		) {
			console.error(`${req.id}: client message:\n${raw}`);
			socket.send(
				ServerMessenger.bad_client_msg(raw.toString()).toString(),
			);
		} else {
			const resp = this.lobby.handleReq(socket, req);
			socket.send(resp.toString());
		}
	}

	private _onWSClose(ws: WebSocket) {
		this.lobby.leaveGame(ws);
	}

	private _createLoggerSocket() {
		const io = require("socket.io")(this.server); //FIXME: REMOVE THIS FROM PACKAGE.JSON WHEN REMOVING FROM APP
		const eventEmitter = new events.EventEmitter();

		eventEmitter.on("logging", function (message) {
			io.emit("log_message", message);
		});

		// Override console.log
		const originConsoleLog = console.log;
		console.log = function (data) {
			data = `[${new Date().toUTCString()}]: ${data}`;
			eventEmitter.emit("logging", data);
			originConsoleLog(data);
		};
	}
}
