import * as dotenv from "dotenv";
import express from "express";
import * as http from "http";
import WebSocket from "ws";

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const wss = new WebSocket.Server({ server });
const ws1 = new WebSocket(`ws://localhost:${port}`);
const ws2 = new WebSocket(`ws://localhost:${port}`);

export default class TestUtils {
	static server = server;
	static sockets = [ws1, ws2];

	/**
	 * Provides two options for sockets to choose from
	 * @param num string "one" or "two" to get socket 0 or 1
	 * @returns websocket 0 or 1 corresponding to string input
	 */
	static getSocket(num: string) {
		let index = -1;
		if (num === "one") {
			index = 0;
		} else if (num === "two") {
			index = 1;
		}
		return this.sockets[index];
	}

	static async setup() {
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
	}

	static tearDown() {
		ws1.close();
		ws2.close();
		wss.close();
		server.close();
	}
}
