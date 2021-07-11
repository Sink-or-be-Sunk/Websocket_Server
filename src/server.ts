import * as dotenv from "dotenv";
import express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import Lobby from "./models/lobby";
import WSMessage from "./models/ws_message";
import ServerMessage from "./models/ServerMessage";

dotenv.config();

const lobby = new Lobby();
const serverMessage = new ServerMessage();

const app = express();

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
	console.log(`Websocket Connected`);

	ws.on("message", function incoming(raw) {
		try {
			const message = new WSMessage(raw.toString());
			ws.send("success!");
		} catch (error) {
			console.error(`${error}: ${raw}`);
			ws.send(serverMessage.FORMAT_ERROR);
		}
	});

	ws.on("close", () => {
		console.log("Connection Closed");
	});
});

const port = process.env.PORT || 8080;

// start our server
server.listen(port, () => {
	console.log(`Server started on port: ${port}/`);
});
