export default class SocketManager {
	socket: WebSocket;

	constructor() {
		this.socket = new WebSocket("ws://sink-or-be-sunk.herokuapp.com/");

		this.socket.onopen = function (event) {
			console.log(event);
		};

		this.socket.onmessage = this.handleServerMessage;

		this.socket.onopen = (event) => {
			this.socket.send("hello server!");
		};
	}

	handleServerMessage(event: any) {
		const data = JSON.parse(event.data);
		console.log(data);
	}
}
