import Game from "../src/server/gameflow/Game";
import WebSocket from "ws";
import Player from "../src/server/gameflow/Player";
import Board from "../src/server/gameflow/Board";
import Layout from "../src/server/gameflow/Layout";
import Move from "../src/server/gameflow/Move";

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

	//PRIVATE

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
		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board.length; col++) {
				const p = board[row][col];
				if (p != GameRunner.POSITIONS.E) {
					list.push(
						new Layout.Position(col, row, this.toLayoutPosition(p)),
					);
				}
			}
		}
		return JSON.stringify(list);
	}

	//PUBLIC

	addPlayers() {
		for (let i = 1; i < this.players.length; i++) {
			const player = this.players[i];
			const resp = this.game.add(player);
			it(`Add ${player.id} to Game`, () => {
				expect(resp).toEqual(true);
			});
		}
	}

	setLayouts() {
		for (let i = 0; i < this.players.length; i++) {
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
			it(`Set Layout for ${player.id}`, () => {
				expect(resp).toEqual(exp);
			});
		}
	}

	private nextPlayer(player: Player): Player {
		for (let i = 0; i < this.players.length; i++) {
			const p = this.players[i];
			if (p.id == player.id) {
				if (i == this.players.length - 1) {
					return this.players[0];
				} else {
					return this.players[i + 1];
				}
			}
		}
		throw Error(
			"Can't Find Player in Players List: this should never happen",
		);
	}

	private pickMove(player: Player, isWinner: boolean): GameRunner.MoveResp {
		const attack = this.nextPlayer(player);
		const board = this.game.getBoardByID(attack.id);
		if (board) {
			if (isWinner) {
				//attack all ships (fastest way to win)
				for (let i = 0; i < board.ships.length; i++) {
					const ship = board.ships[i];
					for (let j = 0; j < ship.squares.length; j++) {
						const square = ship.squares[j];
						if (Board.MoveAllowed(square)) {
							const move = JSON.stringify({
								type: Move.TYPE.SOLO,
								c: square.c,
								r: square.r,
								at: attack.id,
							});

							let exp = new Game.Response(
								true,
								Game.ResponseHeader.HIT,
							);
							if (j == ship.squares.length - 1) {
								exp = new Game.Response(
									true,
									Game.ResponseHeader.SUNK,
									ship.type.toString(),
								);
								if (i == board.ships.length - 1) {
									exp = new Game.Response(
										true,
										Game.ResponseHeader.GAME_OVER,
										ship.type.toString(),
									);
								}
							}

							return { move: move, exp: exp };
						}
					}
				}
				throw Error("Should never get to this point");
			} else {
				//not winner
				//iterate through board with no hits
				for (let c = 0; c < board.size; c++) {
					for (let r = 0; r < board.size; r++) {
						const square = board.grid[c][r];
						if (square.state != Board.STATE.FILLED) {
							//miss every time
							const move = JSON.stringify({
								type: Move.TYPE.SOLO,
								c: square.c,
								r: square.r,
								at: attack.id,
							});
							const exp = new Game.Response(
								true,
								Game.ResponseHeader.MISS,
							);
							return { move: move, exp: exp };
						}
					}
				}
				throw Error(
					"Made it through all miss location on board: this should never occur",
				);
			}
		} else {
			throw Error(
				"Couldn't get board from player: this should never happen",
			);
		}
	}

	makeMoves(winner: number) {
		for (let timeout = 0; timeout < 10000; timeout++) {
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				const { move, exp } = this.pickMove(player, i == winner);
				const resp = this.game.makeMove(player.id, move);
				it(`${player.id} Makes Move ${move}`, () => {
					expect(resp).toEqual(exp);
				});
				if (this.game.isOver()) {
					return;
				}
			}
		}
		throw Error("Timeout occurred when running makeMoves");
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

	export interface MoveResp {
		move: string;
		exp: Game.Response;
	}
}

export default GameRunner;
