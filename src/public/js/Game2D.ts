class Game2D {
	socket: GameSocket;

	constructor(socket: GameSocket) {
		this.socket = socket;
	}

	public newGame() {
		this.socket.sendNewGame();
	}

	public joinGame() {
		const game = $("#game_id").val() as string;
		console.log(game);
		this.socket.sendJoinGame(game);
	}

	public readyUp() {
		const list = [];
		list.push({ r: 0, c: 0, t: "P" });
		list.push({ r: 0, c: 1, t: "P" });

		list.push({ r: 1, c: 0, t: "S" });
		list.push({ r: 1, c: 2, t: "S" });

		list.push({ r: 2, c: 0, t: "B" });
		list.push({ r: 2, c: 3, t: "B" });

		list.push({ r: 3, c: 0, t: "C" });
		list.push({ r: 3, c: 4, t: "C" });
		this.socket.sendShipPositions(list);
	}

	public attack() {
		const col = $("#attack_col").val() as number;
		const row = $("#attack_row").val() as number;
		const opponent = $("#opponent").val() as string;
		const move = { type: MOVE_TYPES.SOLO, r: row, c: col, to: opponent };
		this.socket.sendMakeMove(move);
	}
}
