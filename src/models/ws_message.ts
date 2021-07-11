const REQUESTS = ["newGame"];

export default class WSMessage {
	id: string;
	req: string;

	constructor(data: string) {
		const parse = JSON.parse(data);
		this.id = parse.id;
		this.req = parse.req;

		if (this.id == undefined || this.req == undefined) {
			throw Error("Message Didn't Contain all Fields");
		}
		if (!REQUESTS.includes(this.req)) {
			throw Error(`Invalid Message Request: ${this.req}`);
		}
	}
}
