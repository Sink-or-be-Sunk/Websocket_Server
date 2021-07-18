if (process.env.NODE_ENV !== "production") require("dotenv").config();
import express from "express";
import * as http from "http";
import WebSocket from "ws";
import Lobby from "./models/Lobby";
import WSClientMessage from "./models/WSClientMessage";
import ServerMessenger from "./models/ServerMessenger";

const lobby = new Lobby();

const app = express();

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
	console.log(`Websocket Connected`);
	ws.send(ServerMessenger.CONNECTED.toString());

	ws.on("message", function incoming(raw) {
		try {
			const req = new WSClientMessage(raw.toString());
			const resp = lobby.handleReq(ws, req);
			ws.send(resp.toString());
		} catch (error) {
			console.error(`${error}: client message:\n${raw}`);
			ws.send(ServerMessenger.FORMAT_ERROR.toString());
		}
	});

	ws.on("close", () => {
		lobby.leaveGame(ws);
	});
});

const port = process.env.PORT || 8080;

// start our server
server.listen(port, () => {
	console.log(`Server started on port: ${port}/`);
});
