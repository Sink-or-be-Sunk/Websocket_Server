import express from "express";
import * as http from "http";
import WebSocket from "ws";

export default class TestUtils {
	port: number;
	app: Express.Application;
	server: http.Server;
	wss: WebSocket.Server;
	ws1: WebSocket;
	ws2: WebSocket;
	sockets: WebSocket[];

	static delay = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));

	static silenceLog() {
		jest.spyOn(console, "log").mockImplementation(() => {}); //silence console logs
	}

	constructor() {
		this.port = 8080;
		this.app = express();
		const server = http.createServer(this.app);
		this.server = server;

		this.wss = new WebSocket.Server({ server });
		this.ws1 = new WebSocket(`ws://localhost:${this.port}`);
		this.ws2 = new WebSocket(`ws://localhost:${this.port}`);
		this.sockets = [this.ws1, this.ws2];
	}

	/**
	 * Provides two options for sockets to choose from
	 * @param num string "one" or "two" to get socket 0 or 1
	 * @returns websocket 0 or 1 corresponding to string input
	 */
	getSocket(num: string) {
		let index = -1;
		if (num === "one") {
			index = 0;
		} else if (num === "two") {
			index = 1;
		}
		return this.sockets[index];
	}

	async setup() {
		this.server.listen(this.port, () => {
			console.log(`Server started on port: ${this.port}/`);
		});

		while (this.ws1.readyState !== 1) {
			await TestUtils.delay(5); /// waiting 5 millisecond.
		}
		while (this.ws2.readyState !== 1) {
			await TestUtils.delay(5); /// waiting 5 millisecond.
		}
	}

	async tearDown() {
		this.wss.clients.forEach((client) => {
			client.close();
		});
		await new Promise((resolve, reject) => {
			this.wss.close((err) => {
				if (err) {
					reject(err);
				}
				resolve(null);
			});
		});
		await new Promise((resolve, reject) => {
			this.server.close((err) => {
				if (err) {
					reject(err);
				}
				resolve(null);
			});
		});
		//TODO: updated setup/teardown code to ensure proper server testing without using --detectOpenHandles
	}
}
