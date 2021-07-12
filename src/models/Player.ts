import * as WebSocket from "ws";

export default class Player {
	socket: WebSocket;
	id: string;
	name: string;

	constructor(id: string, socket: WebSocket, name?: string) {
		this.id = id;
		this.socket = socket;
		this.name = name || id;
	}
}
