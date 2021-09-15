// FIXME: REMOVE THIS AS WE DON'T WANT TO EXPOSE WSClientMessage to the web user
// import { v4 as uuidv4 } from "uuid";
// import * as WSClientMessage from "../../../util/WSClientMessage";

// export default class SocketManager {
// 	socket: WebSocket;
// 	id: string;

// 	constructor() {
// 		if (location.protocol === "https:") {
// 			this.socket = new WebSocket("wss://sink-or-be-sunk.herokuapp.com/");
// 		} else {
// 			this.socket = new WebSocket("ws://sink-or-be-sunk.herokuapp.com/");
// 		}
// 		const cachedID = window.localStorage.getItem("id");
// 		if (cachedID) {
// 			this.id = cachedID;
// 		} else {
// 			this.id = uuidv4();
// 			window.localStorage.setItem("id", this.id);
// 		}

// 		this.socket.onopen = function (event) {
// 			console.log(event);
// 		};

// 		this.socket.onmessage = this.handleServerMessage;

// 		this.socket.onopen = (event) => {
// 			const newGame = {
// 				req: WSClientMessage.REQ_TYPE.NEW_GAME,
// 				id: this.id,
// 			};
// 			this.socket.send(JSON.stringify(newGame));
// 		};
// 	}

// 	handleServerMessage(event: any) {
// 		const data = JSON.parse(event.data);
// 		console.log(data);
// 	}
// }
