// export default class WSServerMessage {
// 	header: string;
// 	data: string;

// 	constructor(header: string, data?: string) {
// 		this.header = header;
// 		this.data = data || "none";
// 	}

// 	toString() {
// 		return JSON.stringify({ header: this.header, data: this.data });
// 	}
// }
import { Response } from "../models/gameplay/Game";

type WSServerMessageOptions = {
	meta?: string,
	response?: Response
}
export class WSServerMessage {
	header: SERVER_HEADERS;
	meta: string;

	response: Response;

	constructor(header: SERVER_HEADERS, options?: WSServerMessageOptions) {
		this.header = header;
		this.meta = options.meta ?? "";
		this.response = options.response ?? null;
	}

	toString() {
		const obj = { header: this.header, body: "" };
		if (this.meta !== "") {
			obj.body += this.meta;
		}
		if (this.response) {
			obj.body += this.response.meta;
		}
		return JSON.stringify(obj)
	}
}

export enum SERVER_HEADERS {
	GAME_ALREADY_EXISTS = "GAME ALREADY EXISTS",
	GAME_CREATED = "GAME CREATED",
	MADE_MOVE = "MADE MOVE",
	INVALID_MOVE = "INVALID MOVE"
}