export default class WSServerMessage {
	header: string;
	data: string;

	constructor(header: string, data?: string) {
		this.header = header;
		this.data = data || "none";
	}

	toString() {
		return JSON.stringify({ header: this.header, data: this.data });
	}
}
