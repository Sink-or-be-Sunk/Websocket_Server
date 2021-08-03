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
			this.players.push(new Player(`Player${i}`, socket));
		}
		const p1 = this.players[0];
		this.game = new Game(p1.id, socket, type);
		it(`${p1.id} Creates Game`, () => {
			expect(this.game).toBeTruthy();
		});
	}

	addPlayers() {
		for (let i = 1; i < this.players.length; i++) {
			const player = this.players[i];
			it(`Add ${player.id} to Game`, () => {
				const resp = this.game.add(player);
				expect(resp).toEqual(true);
			});
		}
	}
	private toLayoutPosition(p: GameRunner.POSITIONS): Layout.TYPE {
		if (p == GameRunner.POSITIONS.B) {
			return Layout.TYPE.BATTLESHIP;
		} else if (p == GameRunner.POSITIONS.C) {
			return Layout.TYPE.CARRIER;
		} else if (p == GameRunner.POSITIONS.D) {
			return Layout.TYPE.DESTROYER;
		} else if (p == GameRunner.POSITIONS.P) {
			return Layout.TYPE.PATROL;
		} else if (p == GameRunner.POSITIONS.S) {
			return Layout.TYPE.SUBMARINE;
		} else {
			throw new Error(
				"Invalid GameRunner Position: this should never occur",
			);
		}
	}

	private getPositions(board: GameRunner.POSITIONS[][]): string {
		const list = [];
		for (let c = 0; c < board.length; c++) {
			for (let r = 0; r < board.length; r++) {
				const p = board[c][r];
				if (p != GameRunner.POSITIONS.E) {
					list.push(
						new Layout.Position(c, r, this.toLayoutPosition(p)),
					);
				}
			}
		}
		return JSON.stringify(list);
	}

	setLayouts() {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			it(`Set Layout for ${player.id}`, () => {
				const player = this.players[i];
				const board = this.boards[i];

				const resp = this.game.positionShips(
					player.id,
					this.getPositions(board),
				);
				const exp = new Game.Response(
					true,
					Game.ResponseHeader.SHIP_POSITIONED,
				);
				if (i == this.players.length - 1) {
					exp.addDetail(Game.ResponseHeader.GAME_STARTED);
				}
				expect(resp).toEqual(exp);
			});
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
