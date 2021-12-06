enum MOVE_TYPES {
	SOLO = "SOLO", //TODO: ADD OTHER TYPES
}

interface Move {
	type: MOVE_TYPES;
	r: number;
	c: number;
	to: string;
}

enum GAME_STATE {
	INIT,
	LOBBY,
	IN_GAME,
}

enum SERVER_HEADERS {
	// SERVER HEADERS
	MOVE_MADE = "MADE MOVE",
	INVALID_MOVE = "INVALID MOVE",
	INVALID_OPPONENT = "INVALID OPPONENT",
	INVALID_JOIN = "INVALID JOIN",
	INVALID_LAYOUT = "INVALID LAYOUT",
	INVALID_GAME_TYPE = "INVALID GAME TYPE",
	JOINED_GAME = "JOINED GAME",
	GAME_TYPE_APPROVED = "GAME TYPE APPROVED",
	GAME_STARTED = "GAME STARTED",
	GAME_CREATED = "GAME CREATED",
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

		this.updateConsole(GAME_STATE.INIT);
	}

	private _onmessage(event: any) {
		const data = JSON.parse(event.data);
		console.info("Received Server Message:");
		console.info(data);

		if (data.header === SERVER_HEADERS.MOVE_MADE) {
			console.warn("TODO");
		} else if (data.header === SERVER_HEADERS.INVALID_MOVE) {
			alert(`${data.header}\n${data.meta}`);
		} else if (data.header === SERVER_HEADERS.INVALID_JOIN) {
			alert(`${data.header}\n${data.meta}`);
		} else if (data.header === SERVER_HEADERS.INVALID_OPPONENT) {
			alert(`${data.header}\n${data.meta}`);
		} else if (data.header === SERVER_HEADERS.INVALID_LAYOUT) {
			alert(`${data.header}\n${data.meta}`);
		} else if (data.header === SERVER_HEADERS.INVALID_GAME_TYPE) {
			alert(`${data.header}\n${data.meta}`);
		} else if (data.header === SERVER_HEADERS.BOARD_UPDATE) {
			this.updateBoard(data.meta);
		} else if (data.header === SERVER_HEADERS.JOINED_GAME) {
			this.opponent = data.payload.opponent;
			this.gameMode = data.payload.gameType;
			this.updateConsole(GAME_STATE.LOBBY);
		} else if (data.header === SERVER_HEADERS.GAME_CREATED) {
			this.updateConsole(GAME_STATE.LOBBY);
		} else if (data.header === SERVER_HEADERS.GAME_STARTED) {
			this.updateConsole(GAME_STATE.IN_GAME);
			console.warn("TODO");
		} else if (data.header === SERVER_HEADERS.GAME_TYPE_APPROVED) {
			this.gameMode = data.meta;
		} else if (data.header === SERVER_HEADERS.POSITIONED_SHIPS) {
			this.ships.setPositions(data.payload);
		} else {
			console.warn("IGNORING SERVER MESSAGE");
		}
	}

	private updateConsole(state: GAME_STATE) {
		if (state == GAME_STATE.INIT) {
			$("#NewGame").css({ display: "flex" });
			$("#JoinGame").css({ display: "flex" });
			$("#PositionShips").css({ display: "none" });
			$("#InviteFriend").css({ display: "none" });
			// $("#BasicMode").css({ display: "none" });
		} else if (state == GAME_STATE.LOBBY) {
			$("#NewGame").css({ display: "none" });
			$("#JoinGame").css({ display: "none" });
			$("#PositionShips").css({ display: "flex" });
			$("#InviteFriend").css({ display: "flex" });
			// $("#BasicMode").css({ display: "none" });
		} else if (state == GAME_STATE.IN_GAME) {
			$("#NewGame").css({ display: "none" });
			$("#JoinGame").css({ display: "none" });
			$("#PositionShips").css({ display: "none" });
			$("#InviteFriend").css({ display: "none" });
			// $("#BasicMode").css({ display: "none" });
		} else {
			throw new Error(`Invalid Game State ${state}`);
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
