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

enum SERVER_HEADERS {
	// SERVER HEADERS
	MOVE_MADE = "MADE MOVE",
	INVALID_MOVE = "INVALID MOVE",
	JOINED_GAME = "JOINED GAME",
	GAME_TYPE_APPROVED = "GAME TYPE APPROVED",
	INVALID_JOIN = "INVALID JOIN",
	INVALID_OPPONENT = "INVALID OPPONENT",
	BOARD_UPDATE = "BOARD UPDATE",
	POSITIONED_SHIPS = "POSITIONED SHIPS",
}
class GameSocket {
	// ERRORS
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

	/** unique identifier: either username for web or device id for mcu */
	private uid: string;
	private socket: BaseSocket;
	private opponent: string;
	private gameMode: string;
	private ships: ShipGamePieces;

	constructor(uid: string, ships: ShipGamePieces) {
		//FIXME: NEED TO FIND A WAY TO ID THIS AS A WEB VS MCU REQUEST, maybe have MCU send device id and do database call for username
		this.uid = uid;
		this.opponent = SERVER_HEADERS.INVALID_OPPONENT;
		this.gameMode = this.GAME_TYPE_CLASSIC;
		this.ships = ships;

		this.socket = new BaseSocket(uid, this);
	}

	private _onmessage(event: any) {
		const data = JSON.parse(event.data);
		console.info("Received Server Message:");
		console.info(data);

		if (data.header === SERVER_HEADERS.MOVE_MADE) {
		} else if (data.header === SERVER_HEADERS.INVALID_MOVE) {
		} else if (data.header === SERVER_HEADERS.BOARD_UPDATE) {
			this.updateBoard(data.meta);
		} else if (data.header === SERVER_HEADERS.JOINED_GAME) {
			this.opponent = data.payload.opponent;
			this.gameMode = data.payload.gameType;
		} else if (data.header === SERVER_HEADERS.INVALID_JOIN) {
		} else if (data.header === SERVER_HEADERS.GAME_TYPE_APPROVED) {
			this.gameMode = data.meta;
		} else if (data.header === SERVER_HEADERS.POSITIONED_SHIPS) {
			console.log(
				"//TODO: NEED TO LOCK SHIP POSITIONS SO YOU CAN'T MOVE THEM",
			);
		} else {
			console.warn("IGNORING SERVER MESSAGE");
		}
	}

	private updateBoard(states: string) {
		for (let i = 0; i < states.length; i++) {
			const state = states[i];
			const square = $(`#square${i}`);
			square.removeClass("grid-cell-clear");
			square.removeClass("grid-cell-full");
			if (state === "H") {
				square.addClass("grid-cell-hit");
			} else if (state === "M") {
				square.addClass("grid-cell-miss");
			} else if (state === "F") {
				square.addClass("grid-cell-full");
			} else if (state === "S") {
				square.addClass("grid-cell-sunk");
			} else if (state === "E") {
				square.addClass("grid-cell-clear");
			} else {
				throw new Error(`Invalid Square State: ${state}`);
			}
		}
	}

	public sendGameInvite() {
		const friend = $("#friend_list").val() as string;
		if (friend) {
			const req = { type: this.INVITE_TO_GAME, data: friend };
			const obj = { req: this.DATABASE_REQUEST, id: this.uid, data: req };
			this.socket.send(obj);
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
		this.socket.send(obj);
	}

	public sendGetFriends() {
		const req = { type: this.GET_FRIENDS };
		const obj = { req: this.DATABASE_REQUEST, id: this.uid, data: req };
		this.socket.send(obj);
	}

	public sendNewGame() {
		const obj = { req: this.NEW_GAME, id: this.uid };
		this.socket.send(obj);
	}

	public sendJoinGame() {
		const game = $("#game_id").val() as string;
		const obj = { req: this.JOIN_GAME, id: this.uid, data: game };
		this.socket.send(obj);
	}

	public sendShipPositions(list: ShipPos[]) {
		const obj = { req: this.POSITION_SHIPS, id: this.uid, data: list };
		this.socket.send(obj);
	}

	public sendMakeMove(col: number, row: number) {
		// const col = $("#attack_col").val() as number;
		// const row = $("#attack_row").val() as number;
		const move = {
			type: MOVE_TYPES.SOLO,
			r: row,
			c: col,
			to: this.opponent,
		};
		const obj = { req: this.MAKE_MOVE, id: this.uid, data: move };
		this.socket.send(obj);
	}
}
