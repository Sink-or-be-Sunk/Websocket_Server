import Move from "./Move";
import Game from "./Game";
import Ship from "./Ship";

class Board {
	id: string;
	grid: Board.Square[][];
	ships: Ship[];
	type: Board.TYPE;
	/**
	 * m x m size of grid
	 */
	size: number;

	constructor(id: string, size: number, type: Board.TYPE) {
		this.id = id;
		this.size = size;
		this.type = type;
		this.grid = this.initGrid();
		this.ships = this.initShips();
	}

	private initShips() {
		let ships = new Array<Ship>();
		if (this.type == Board.TYPE.DEFAULT) {
			ships = [
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.grid),
				new Ship(new Ship.Type(Ship.CLASS.SUBMARINE), this.grid),
				new Ship(new Ship.Type(Ship.CLASS.DESTROYER), this.grid),
				new Ship(new Ship.Type(Ship.CLASS.BATTLESHIP), this.grid),
				new Ship(new Ship.Type(Ship.CLASS.CARRIER), this.grid),
			];
		} else if (this.type == Board.TYPE.SMALL) {
			ships = [
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.grid),
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.grid),
			];
		}
		return ships;
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

	private shipsRemaining() {
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			if (ship.state != Ship.STATE.SUNK) {
				return true;
			}
		}
		return false;
	}

	attack(move: Move) {
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			const res = ship.attack(move);
			if (res) {
				if (ship.state == Ship.STATE.SUNK) {
					if (this.shipsRemaining()) {
						return new Game.Response(
							true,
							Game.ResponseHeader.SUNK,
							ship.type.toString(),
						);
					} else {
						return new Game.Response(
							true,
							Game.ResponseHeader.GAME_OVER,
							ship.type.toString(),
						);
					}
				} else {
					return new Game.Response(true, Game.ResponseHeader.HIT);
				}
			}
		}
		return new Game.Response(true, Game.ResponseHeader.MISS);
	}

	makeMove(move: Move) {
		const square = this.grid[move.c][move.r];
		if (
			square.state == Board.STATE.HIT ||
			square.state == Board.STATE.MISS
		) {
			return new Game.Response(false, Game.ResponseHeader.MOVE_REPEATED);
		}
		return this.attack(move);
	}
}

namespace Board {
	export enum STATE {
		EMPTY = " ",
		FILLED = "F",
		HIT = "H",
		MISS = "M",
	}

	export enum TYPE {
		DEFAULT = "DEFAULT",
		SMALL = "SMALL",
		INVALID = "INVALID",
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
