export default class SocketManager {
	socket: WebSocket;
	id: string;

	constructor() {
		if (location.protocol === "https:") {
			this.socket = new WebSocket("wss://sink-or-be-sunk.herokuapp.com/");
		} else {
			this.socket = new WebSocket("ws://sink-or-be-sunk.herokuapp.com/");
		}
		const cachedID = window.localStorage.getItem("id");
		if (cachedID) {
			this.id = cachedID;
		} else {
			window.localStorage.setItem("id", this.id);
		}

		this.socket.onopen = function (event) {
			console.log(event);
		};

		this.socket.onmessage = this.handleServerMessage;

		this.socket.onopen = (event) => {
			const newGame = {
				req: "NEW GAME",
				id: this.id,
			};
			this.socket.send(JSON.stringify(newGame));
		};
	}

	handleServerMessage(event: any) {
		const data = JSON.parse(event.data);
		console.log(data);
	}
}
