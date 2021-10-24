class Game2D {
	socket: GameSocket;
	isBasicMode: boolean;

	constructor(socket: GameSocket) {
		this.socket = socket;
		this.isBasicMode = false;
	}
}
