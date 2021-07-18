import * as dotenv from "dotenv";
import express from "express";
import * as http from "http";
import Lobby from "../models/Lobby";
import ServerMessenger from "../models/ServerMessenger";
import WSMessage from "../models/WSClientMessage";
import WebSocket from "ws";

dotenv.config();

const port = process.env.PORT || 8080;

const app = express();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
	jest.spyOn(console, "log").mockImplementation(() => {});
});

test("sample", async () => {
	// initialize a simple http server
	const server = http.createServer(app);

	const wss = new WebSocket.Server({ server });

	server.listen(port, () => {
		console.log(`Server started on port: ${port}/`);
	});

	const ws = new WebSocket(`ws://localhost:${port}`);

	while (ws.readyState !== 1) {
		await delay(5); /// waiting 1 second.
	}

	const lobby = new Lobby();
	const msg = new WSMessage(JSON.stringify({ id: "one", req: "newGame" }));
	const resp = lobby.handleReq(ws, msg);

	expect(resp).toBe(ServerMessenger.GAME_CREATED);

	ws.close();
	wss.close();
	server.close();
});
