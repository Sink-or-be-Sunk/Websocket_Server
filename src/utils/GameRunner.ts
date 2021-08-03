import Game from "../server/models/Game";
import WebSocket from "ws";
import Player from "../server/models/Player";
import Board from "../server/models/Board";
import Layout from "../server/models/Layout";

class GameRunner {
	game: Game;
	players: Player[];
	boards: GameRunner.POSITIONS[][][];

	constructor(
		socket: WebSocket,
		type: Game.TYPE,
		boards: GameRunner.POSITIONS[][][],
	) {
		this.boards = boards;
		this.players = [];
		for (let i = 1; i <= boards.length; i++) {
			this.players.push(new Player(`player${i}`, socket));
		}
		this.game = new Game(this.players[0].id, socket, type);
	}

	addPlayers() {
		for (let i = 1; i < this.players.length; i++) {
			const resp = this.game.add(this.players[i]);
			expect(resp).toEqual(true);
		}
	}
}

namespace GameRunner {
	export enum POSITIONS {
		E = Board.STATE.EMPTY,
		P = Layout.TYPE.PATROL,
		S = Layout.TYPE.SUBMARINE,
		D = Layout.TYPE.DESTROYER,
		B = Layout.TYPE.BATTLESHIP,
		C = Layout.TYPE.CARRIER,
	}
}

export default GameRunner;
