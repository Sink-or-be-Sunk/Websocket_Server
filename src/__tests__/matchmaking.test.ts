import * as dotenv from "dotenv";
import express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import Lobby from "../models/Lobby";
import ServerMessenger from "../models/ServerMessenger";
import WSMessage from "../models/WSClientMessage";

dotenv.config();

describe("matchmaking server", () => {
	const lobby = new Lobby();

	const app = express();

	// initialize a simple http server
	const server = http.createServer(app);

	// initialize the WebSocket server instance
	const wss = new WebSocket.Server({ server });

	wss.on("connection", (ws: WebSocket) => {
		console.log(`Websocket Connected`);
		ws.send(ServerMessenger.CONNECTED.toString());

		expect(true).toBe(true);

		// ws.on("message", function incoming(raw) {
		// 	try {
		// 		const req = new WSMessage(raw.toString());
		// 		const resp = lobby.handleReq(ws, req);
		// 		ws.send(resp.toString());
		// 	} catch (error) {
		// 		console.error(`${error}: client message:\n${raw}`);
		// 		ws.send(ServerMessenger.FORMAT_ERROR.toString());
		// 	}
		// });

		// ws.on("close", () => {
		// 	lobby.leaveGame(ws);
		// });
	});

	// // start our server
	// server.listen(process.env.PORT, () => {
	// 	console.log(`Server started on port: ${process.env.PORT}/`);
	// });
});
