import WebSocket from "ws";

export default class Player {
	socket: WebSocket;
	id: string;
	name: string;
	/**
	 * Indicated Player is ready to start, i.e. there ships are all in place
	 */
	ready: boolean;

	constructor(id: string, socket: WebSocket, name?: string) {
		this.id = id;
		this.socket = socket;
		this.name = name || id;
		this.ready = false;
	}
}
