interface ShipPos {
	r: number;
	c: number;
	t: "P" | "D" | "S" | "B" | "C";
}

interface Move {
	type: "SOLO"; //TODO: ADD OTHER TYPES
	r: number;
	c: number;
	to: string;
}
class GameSocket {
	// CLIENT HEADERS
	private readonly NEW_GAME = "NEW GAME";
	private readonly MAKE_MOVE = "MAKE MOVE";
	private readonly POSITION_SHIPS = "POSITION SHIPS";
	private readonly JOIN_GAME = "JOIN GAME";
	// private readonly GAME_TYPE = "GAME TYPE";
	// private readonly GAME_TYPE_BASIC = "BASIC";
	// private readonly GAME_TYPE_CLASSIC = "CLASSIC";

	// SERVER HEADERS
	private readonly MOVE_MADE = "MADE MOVE";
	private readonly INVALID_MOVE = "INVALID MOVE";
	private readonly JOINED_GAME = "JOINED GAME";
	private readonly INVALID_JOIN = "INVALID JOIN";

	/**
	 * unique identifier: either username for web or device id for mcu
	 */
	private uid;
	private socket;

	constructor(uid: string) {
		this.uid = uid;

		const protocol = location.protocol == "https" ? "wss" : "ws";
		const uri = protocol + "://" + location.hostname + ":" + location.port;
		this.socket = new WebSocket(uri);

		this.socket.onmessage = (event: any) => {
			this._onmessage(event);
		};

		this.socket.onopen = (event: any) => {
			console.log(event);
			this.sendNewGame();
			this.sendJoinGame("mitchaarndt");
			this.sendMakeMove({ r: 0, c: 0, type: "SOLO", to: "mitchaarndt" });
			this.sendShipPositions([{ r: 0, c: 0, t: "P" }]);
		};
	}

	private _onmessage(event: any) {
		const data = JSON.parse(event.data);
		console.info("Received Server Message:");
		console.info(data);

		if (data.header === this.MOVE_MADE) {
		} else if (data.header === this.INVALID_MOVE) {
		} else if (data.header === this.JOINED_GAME) {
		} else if (data.header === this.INVALID_JOIN) {
		} else {
			console.warn("IGNORING SERVER MESSAGE");
		}
	}

	private _send(obj: any) {
		const str = JSON.stringify(obj);
		this.socket.send(str);
	}

	public sendNewGame() {
		const obj = { req: this.NEW_GAME, id: this.uid };
		this._send(obj);
	}

	public sendJoinGame(game: string) {
		const obj = { req: this.JOIN_GAME, id: this.uid, data: game };
		this._send(obj);
	}

	public sendShipPositions(list: ShipPos[]) {
		const obj = { req: this.POSITION_SHIPS, id: this.uid, data: list };
		this._send(obj);
	}

	public sendMakeMove(move: Move) {
		const obj = { req: this.MAKE_MOVE, id: this.uid, data: move };
		this._send(obj);
	}
}
