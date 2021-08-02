import Move from "./Move";
import Game from "./Game";
import Ship from "./Ship";
import Layout from "./Layout";
import FleetBuilder from "./FleetBuilder";

class Board {
	id: string;
	grid: Board.Square[][];
	ships: Ship[];
	// type: Board.TYPE;
	/**
	 * m x m size of grid
	 */
	size: number;

	constructor(id: string, rules: Game.Rules) {
		this.id = id;
		this.size = rules.boardSize;
		// this.type = type;
		this.grid = this.initGrid();
		this.ships = [];
	}

	// private initShips(): Ship[] {
	// 	let ships = new Array<Ship>();
	// 	if (this.type == Board.TYPE.DEFAULT) {
	// 		ships = [
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.PATROL), this.grid),
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.SUBMARINE), this.grid),
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.DESTROYER), this.grid),
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.BATTLESHIP), this.grid),
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.CARRIER), this.grid),
	// 		];
	// 	} else if (this.type == Board.TYPE.SMALL) {
	// 		ships = [
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.PATROL), this.grid),
	// 			new Ship(new Ship.Type(Ship.DESCRIPTOR.PATROL), this.grid),
	// 		];
	// 	}
	// 	return ships;
	// }

	private initGrid(): Board.Square[][] {
		const grid = new Array<Array<Board.Square>>();
		for (let c = 0; c < this.size; c++) {
			grid[c] = [];
			for (let r = 0; r < this.size; r++) {
				grid[c][r] = new Board.Square(c, r);
			}
		}
		return grid;
	}

	private shipsRemaining(): boolean {
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			if (ship.state != Ship.STATE.SUNK) {
				return true;
			}
		}
		return false;
	}

	attack(move: Move): Game.Response {
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

	makeMove(move: Move): Game.Response {
		const square = this.grid[move.c][move.r];
		if (
			square.state == Board.STATE.HIT ||
			square.state == Board.STATE.MISS
		) {
			return new Game.Response(false, Game.ResponseHeader.MOVE_REPEATED);
		}
		return this.attack(move);
	}

	updateShipLayout(layout: Layout, rules: Game.Rules): Game.Response {
		let list = layout.list.sort((a, b) => {
			if (a.r == b.r) {
				return a.c < b.c ? -1 : 1;
			} else {
				return a.r < b.r ? -1 : 1;
			}
		});
		//list is sorted from 0,0 -> x,0 -> 0,1 -> x,1 -> ...
		const builder = new FleetBuilder(this.grid, rules);
		for (let i = 0; i < list.length; i++) {
			const cur = list[i];
			let found = false;
			for (let j = i + 1; j < list.length; j++) {
				const search = list[j];
				if (cur.o == Layout.Orientation.VERTICAL) {
					if (search.c == cur.c) {
						const res = builder.add(cur, search);
						if (!res.valid) {
							return res;
						}
						list.splice(j, 1); //remove search from list
						found = true;
						break;
					}
				} else if (cur.o == Layout.Orientation.HORIZONTAL) {
					if (search.r == cur.r) {
						const res = builder.add(cur, search);
						if (!res.valid) {
							return res;
						}
						list.splice(j, 1); //remove search from list
						found = true;
						break;
					}
				}
			}
			if (!found) {
				return new Game.Response(
					false,
					Game.ResponseHeader.SHIP_POSITIONER_MISMATCH,
				);
			}
		}
		this.ships = builder.fleet;
		return new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED);
	}
}

namespace Board {
	export enum STATE {
		EMPTY = " ",
		FILLED = "F",
		HIT = "H",
		MISS = "M",
	}

	// export enum TYPE {
	// 	DEFAULT = "DEFAULT",
	// 	SMALL = "SMALL",
	// 	INVALID = "INVALID",
	// }
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
