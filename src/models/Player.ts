import * as WebSocket from "ws";

export default class Player {
	socket: WebSocket;
	id: string;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.socket = socket;
	}
}
