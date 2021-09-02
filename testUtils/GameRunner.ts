import {
	Game,
	GAME_TYPE,
	Response,
	ResponseHeader,
} from "../src/models/gameplay/Game";
import WebSocket from "ws";
import Player from "../src/models/gameplay/Player";
import { BOARD_STATE, MoveAllowed } from "../src/models/gameplay/Board";
import { LAYOUT_TYPE, Position } from "../src/models/gameplay/Layout";
import { MOVE_TYPE } from "../src/models/gameplay/Move";

export class GameRunner {
  game: Game;
  players: Player[];
  boards: RUNNER_POSITION[][][];

  constructor(
  	socket: WebSocket,
  	type: GAME_TYPE,
  	boards: RUNNER_POSITION[][][]
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

  private toLayoutPosition(p: RUNNER_POSITION): LAYOUT_TYPE {
  	if (p == RUNNER_POSITION.B) {
  		return LAYOUT_TYPE.BATTLESHIP;
  	} else if (p == RUNNER_POSITION.C) {
  		return LAYOUT_TYPE.CARRIER;
  	} else if (p == RUNNER_POSITION.D) {
  		return LAYOUT_TYPE.DESTROYER;
  	} else if (p == RUNNER_POSITION.P) {
  		return LAYOUT_TYPE.PATROL;
  	} else if (p == RUNNER_POSITION.S) {
  		return LAYOUT_TYPE.SUBMARINE;
  	} else {
  		throw new Error("Invalid GameRunner Position: this should never occur");
  	}
  }

  private getPositions(board: RUNNER_POSITION[][]): string {
  	const list = [];
  	for (let row = 0; row < board.length; row++) {
  		for (let col = 0; col < board.length; col++) {
  			const p = board[row][col];
  			if (p != RUNNER_POSITION.E) {
  				list.push(new Position(col, row, this.toLayoutPosition(p)));
  			}
  		}
  	}
  	return JSON.stringify(list);
  }

  //PUBLIC

  addPlayers(): void {
  	for (let i = 1; i < this.players.length; i++) {
  		const player = this.players[i];
  		const resp = this.game.add(player);
  		it(`Add ${player.id} to Game`, () => {
  			expect(resp).toEqual(true);
  		});
  	}
  }

  setLayouts(): void {
  	for (let i = 0; i < this.players.length; i++) {
  		const player = this.players[i];
  		const board = this.boards[i];

  		const resp = this.game.positionShips(player.id, this.getPositions(board));
  		const exp = new Response(true, ResponseHeader.SHIP_POSITIONED);
  		if (i == this.players.length - 1) {
  			exp.addDetail(ResponseHeader.GAME_STARTED);
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
  	throw Error("Can't Find Player in Players List: this should never happen");
  }

  private pickMove(player: Player, isWinner: boolean): MoveResp {
  	const attack = this.nextPlayer(player);
  	const board = this.game.getBoardByID(attack.id);
  	if (board) {
  		if (isWinner) {
  			//attack all ships (fastest way to win)
  			for (let i = 0; i < board.ships.length; i++) {
  				const ship = board.ships[i];
  				for (let j = 0; j < ship.squares.length; j++) {
  					const square = ship.squares[j];
  					if (MoveAllowed(square)) {
  						const move = JSON.stringify({
  							type: MOVE_TYPE.SOLO,
  							c: square.c,
  							r: square.r,
  							at: attack.id,
  						});

  						let exp = new Response(true, ResponseHeader.HIT);
  						if (j == ship.squares.length - 1) {
  							exp = new Response(
  								true,
  								ResponseHeader.SUNK,
  								ship.type.toString()
  							);
  							if (i == board.ships.length - 1) {
  								exp = new Response(
  									true,
  									ResponseHeader.GAME_OVER,
  									ship.type.toString()
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
  					if (square.state != BOARD_STATE.FILLED) {
  						//miss every time
  						const move = JSON.stringify({
  							type: MOVE_TYPE.SOLO,
  							c: square.c,
  							r: square.r,
  							at: attack.id,
  						});
  						const exp = new Response(true, ResponseHeader.MISS);
  						return { move: move, exp: exp };
  					}
  				}
  			}
  			throw Error(
  				"Made it through all miss location on board: this should never occur"
  			);
  		}
  	} else {
  		throw Error("Couldn't get board from player: this should never happen");
  	}
  }

  makeMoves(winner: number): void {
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
export enum RUNNER_POSITION {
  E = BOARD_STATE.EMPTY,
  P = LAYOUT_TYPE.PATROL,
  S = LAYOUT_TYPE.SUBMARINE,
  D = LAYOUT_TYPE.DESTROYER,
  B = LAYOUT_TYPE.BATTLESHIP,
  C = LAYOUT_TYPE.CARRIER,
}

export interface MoveResp {
  move: string;
  exp: Response;
}
