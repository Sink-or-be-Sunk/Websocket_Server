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
}
