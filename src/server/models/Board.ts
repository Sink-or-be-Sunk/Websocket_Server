import Move from "./Move";
import Fleet from "./Fleet";
import Game from "./Game";
class Board {
	id: string;
	grid: Board.Square[][];
	fleet: Fleet;
	/**
	 * m x m size of grid
	 */
	size: number;

	constructor(id: string, size: number) {
		this.id = id;
		this.size = size;
		this.grid = this.initGrid();
		this.fleet = new Fleet(Fleet.TYPE.DEFAULT, this);
	}

	private initGrid() {
		const grid = new Array<Array<Board.Square>>();
		for (let c = 0; c < this.size; c++) {
			grid[c] = [];
			for (let r = 0; r < this.size; r++) {
				grid[c][r] = new Board.Square(c, r);
			}
		}
		return grid;
	}

	makeMove(move: Move) {
		const square = this.grid[move.c][move.r];
		if (square.state != Board.STATE.EMPTY) {
			return new Game.Response(false, Game.ResponseHeader.MOVE_REPEATED);
		}
		return this.fleet.attack(move);
	}
}

namespace Board {
	export enum STATE {
		EMPTY = " ",
		HIT = "H",
		MISS = "M",
	}
	export class Square {
		state: STATE;
		c: number;
		r: number;

		constructor(c: number, r: number) {
			this.c = c;
			this.r = r;
			this.state = Board.STATE.EMPTY; //default
		}

		hit() {
			this.state = STATE.HIT;
		}

		miss() {
			this.state = STATE.MISS;
		}
	}
}

export default Board;
