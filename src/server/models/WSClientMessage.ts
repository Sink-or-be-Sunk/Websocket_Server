export default class WSClientMessage {
	static NEW_GAME = "newGame";
	static MAKE_MOVE = "makeMove";
	static JOIN_GAME = "joinGame";

	static REQUESTS = [
		WSClientMessage.NEW_GAME,
		WSClientMessage.MAKE_MOVE,
		WSClientMessage.JOIN_GAME,
	];
	req: string;
	id: string;
	data: string;

	constructor(data: string) {
		const parse = JSON.parse(data);
		this.id = parse.id;
		this.req = parse.req;
		this.data = parse.data;

		if (this.id == undefined || this.req == undefined) {
			throw Error("Message Didn't Contain all Fields");
		}
		if (!WSClientMessage.REQUESTS.includes(this.req)) {
			throw Error(`Invalid Message Request: ${this.req}`);
		}
	}

	toString() {
		return JSON.stringify({ req: this.req, id: this.id, data: this.data });
	}
}
