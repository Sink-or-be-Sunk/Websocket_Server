interface ShipPos {
	r: number;
	c: number;
	t: "P" | "S" | "B" | "C";
}

enum MOVE_TYPES {
	SOLO = "SOLO", //TODO: ADD OTHER TYPES
}

interface Move {
	type: MOVE_TYPES;
	r: number;
	c: number;
	to: string;
}
class GameSocket {
	// ERRORS
	private readonly SOCKET_NOT_OPEN =
		"Must wait for socket to be open before sending message";
	// CLIENT HEADERS
	private readonly NEW_GAME = "NEW GAME";
	private readonly MAKE_MOVE = "MAKE MOVE";
	private readonly POSITION_SHIPS = "POSITION SHIPS";
	private readonly JOIN_GAME = "JOIN GAME";
	private readonly GAME_TYPE = "GAME TYPE";
	private readonly GAME_TYPE_BASIC = "BASIC";
	private readonly GAME_TYPE_CLASSIC = "CLASSIC";
	// private readonly GAME_TYPE_SOLO = "SOLO";
	private readonly DATABASE_REQUEST = "DATABASE";
	private readonly GET_FRIENDS = "GET FRIENDS";
	private readonly INVITE_TO_GAME = "INVITE TO GAME";

	// SERVER HEADERS
	private readonly MOVE_MADE = "MADE MOVE";
	private readonly INVALID_MOVE = "INVALID MOVE";
	private readonly JOINED_GAME = "JOINED GAME";
	private readonly GAME_TYPE_APPROVED = "GAME TYPE APPROVED";
	private readonly INVALID_JOIN = "INVALID JOIN";
	private readonly INVALID_OPPONENT = "INVALID OPPONENT";

	/** unique identifier: either username for web or device id for mcu */
	private uid: string;
	private socket: WebSocket;
	private opponent: string;
	private gameMode: string;

	constructor(uid: string) {
		this.uid = uid;
		//FIXME: NEED TO FIND A WAY TO ID THIS AS A WEB VS MCU REQUEST, maybe have MCU send device id and do database call for username

		this.opponent = this.INVALID_OPPONENT;
		this.gameMode = this.GAME_TYPE_CLASSIC;

		const protocol = location.protocol == "https:" ? "wss" : "ws";
		const uri = protocol + "://" + location.hostname + ":" + location.port;
		this.socket = new WebSocket(uri);

		this.socket.onmessage = (event: any) => {
			this._onmessage(event);
		};

		this.socket.onopen = (event: any) => {
			console.log(event);
		};
	}

	private _onmessage(event: any) {
		const data = JSON.parse(event.data);
		console.info("Received Server Message:");
		console.info(data);

		if (data.header === this.MOVE_MADE) {
		} else if (data.header === this.INVALID_MOVE) {
		} else if (data.header === this.JOINED_GAME) {
			this.opponent = data.payload.opponent;
			this.gameMode = data.payload.gameType;
		} else if (data.header === this.INVALID_JOIN) {
		} else if (data.header === this.GAME_TYPE_APPROVED) {
			this.gameMode = data.meta;
		} else {
			console.warn("IGNORING SERVER MESSAGE");
		}
	}

	private _send(obj: any) {
		if (this.socket.readyState == this.socket.OPEN) {
			console.info("Sending Message:");
			console.info(obj);
			const str = JSON.stringify(obj);
			this.socket.send(str);
		} else {
			console.error(this.SOCKET_NOT_OPEN);
		}
	}

	public sendGameInvite() {
		const friend = $("#friend_list").val() as string;
		if (friend) {
			console.log(friend);
			const req = { type: this.INVITE_TO_GAME, data: friend };
			const obj = { req: this.DATABASE_REQUEST, id: this.uid, data: req };
			this._send(obj);
		} else {
			console.error("Must Choose a Friend to Invite!");
		}
	}

	public sendBasicMode() {
		const obj = {
			req: this.GAME_TYPE,
			id: this.uid,
			data: this.GAME_TYPE_BASIC,
		};
		this._send(obj);
	}

	public sendGetFriends() {
		const req = { type: this.GET_FRIENDS };
		const obj = { req: this.DATABASE_REQUEST, id: this.uid, data: req };
		this._send(obj);
	}

	public sendNewGame() {
		const obj = { req: this.NEW_GAME, id: this.uid };
		this._send(obj);
	}

	public sendJoinGame() {
		const game = $("#game_id").val() as string;
		const obj = { req: this.JOIN_GAME, id: this.uid, data: game };
		this._send(obj);
	}

	public sendShipPositions() {
		const list = [];
		if (this.gameMode == this.GAME_TYPE_BASIC) {
			list.push({ r: 0, c: 0, t: "P" });
			list.push({ r: 0, c: 1, t: "P" });

			list.push({ r: 0, c: 0, t: "D" });
			list.push({ r: 0, c: 2, t: "D" });
		} else {
			list.push({ r: 0, c: 0, t: "P" });
			list.push({ r: 0, c: 1, t: "P" });

			list.push({ r: 1, c: 0, t: "S" });
			list.push({ r: 1, c: 2, t: "S" });

			list.push({ r: 2, c: 0, t: "B" });
			list.push({ r: 2, c: 3, t: "B" });

			list.push({ r: 3, c: 0, t: "C" });
			list.push({ r: 3, c: 4, t: "C" });
		}
		const obj = { req: this.POSITION_SHIPS, id: this.uid, data: list };
		this._send(obj);
	}

	public sendMakeMove() {
		const col = $("#attack_col").val() as number;
		const row = $("#attack_row").val() as number;
		const move = {
			type: MOVE_TYPES.SOLO,
			r: row,
			c: col,
			to: this.opponent,
		};
		const obj = { req: this.MAKE_MOVE, id: this.uid, data: move };
		this._send(obj);
	}
}
