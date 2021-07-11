import Game from "./game";

export default class Lobby {
	games: Game[];

	constructor() {
		this.games = [];
	}

	getGame(id: string): Game | null {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			if (game.id == id) {
				return game;
			}
		}
		return null;
	}

	addGame(game: Game) {
		this.games.push(game);
	}
}
