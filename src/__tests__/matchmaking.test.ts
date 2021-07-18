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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const ws1 = new WebSocket(`ws://localhost:${port}`);
const ws2 = new WebSocket(`ws://localhost:${port}`);

beforeAll(async () => {
	jest.spyOn(console, "log").mockImplementation(() => {}); //silence console logs

	server.listen(port, () => {
		console.log(`Server started on port: ${port}/`);
	});

	while (ws1.readyState !== 1) {
		await delay(5); /// waiting 5 millisecond.
	}
	while (ws2.readyState !== 1) {
		await delay(5); /// waiting 5 millisecond.
	}
});

afterAll(() => {
	ws1.close();
	ws2.close();
	wss.close();
	server.close();
});

describe("Basic Matchmaking", () => {
	// initialize a simple http server
	const lobby = new Lobby();

	it("Player 1 Creates New Game", () => {
		const req = { id: "one", req: WSMessage.NEW_GAME };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(ws1, msg);
		expect(resp).toStrictEqual(ServerMessenger.GAME_CREATED);
	});

	it("Player 2 Joins the Game", () => {
		const req = { id: "two", req: WSMessage.JOIN_GAME, data: "one" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(ws2, msg);
		expect(resp).toStrictEqual(ServerMessenger.joined(req.data));
	});

	it("Player 1 Makes a Move", () => {
		const req = { id: "one", req: WSMessage.MAKE_MOVE, data: "move" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(ws1, msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Makes a Move", () => {
		const req = { id: "two", req: WSMessage.MAKE_MOVE, data: "move" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(ws2, msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});
});
