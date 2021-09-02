import { Move } from "./Move";
import { Rules, ResponseHeader, Response } from "./Game";
import { Ship, SHIP_STATE } from "./Ship";
import { Layout, Position } from "./Layout";
import FleetBuilder from "./FleetBuilder";

export class Board {
  id: string;
  grid: Square[][];
  ships: Ship[];
  view: string[];
  /**
   * m x m size of grid
   */
  size: number;

  constructor(id: string, rules: Rules) {
  	this.id = id;
  	this.size = rules.boardSize;
  	this.grid = this.initGrid();
  	this.view = [];
  	this.updateView();
  	this.ships = [];
  }

  private initGrid(): Square[][] {
  	const grid = new Array<Array<Square>>();
  	for (let c = 0; c < this.size; c++) {
  		grid[c] = [];
  		for (let r = 0; r < this.size; r++) {
  			grid[c][r] = new Square(c, r);
  		}
  	}
  	return grid;
  }

  private shipsRemaining(): boolean {
  	for (let i = 0; i < this.ships.length; i++) {
  		const ship = this.ships[i];
  		if (ship.state != SHIP_STATE.SUNK) {
  			return true;
  		}
  	}
  	return false;
  }

  private updateView() {
  	this.view = []; //clear
  	for (let r = 0; r < this.size; r++) {
  		this.view[r] = "|";
  		for (let c = 0; c < this.size; c++) {
  			this.view[r] += `${this.grid[c][r].state}|`;
  		}
  	}
  }

  attack(move: Move): Response {
  	for (let i = 0; i < this.ships.length; i++) {
  		const ship = this.ships[i];
  		const res = ship.attack(move);
  		if (res) {
  			if (ship.state == SHIP_STATE.SUNK) {
  				if (this.shipsRemaining()) {
  					return new Response(
  						true,
  						ResponseHeader.SUNK,
  						ship.type.toString()
  					);
  				} else {
  					return new Response(
  						true,
  						ResponseHeader.GAME_OVER,
  						ship.type.toString()
  					);
  				}
  			} else {
  				return new Response(true, ResponseHeader.HIT);
  			}
  		}
  	}
  	return new Response(true, ResponseHeader.MISS);
  }

  makeMove(move: Move): Response {
  	const square = this.grid[move.c][move.r];
  	if (square.state == BOARD_STATE.HIT || square.state == BOARD_STATE.MISS) {
  		return new Response(false, ResponseHeader.MOVE_REPEATED);
  	}
  	return this.attack(move);
  }

  private getSquareList(start: Position, end: Position): Square[] | false {
  	try {
  		const list = [];

  		if (start.c == end.c) {
  			//VERTICAL
  			if (start.c >= this.size) {
  				throw Error("Col Out of Bounds");
  			}
  			for (let r = start.r; r < this.size; r++) {
  				const square = this.grid[start.c][r];
  				square.state = BOARD_STATE.FILLED;
  				list.push(square);
  				if (end.r == r) {
  					return list;
  				}
  			}
  			throw Error("Row Out of Bounds");
  		} else if (start.r == end.r) {
  			//HORIZONTAL
  			if (start.r >= this.size) {
  				throw Error("Row Out of Bounds");
  			}
  			for (let c = start.c; c < this.size; c++) {
  				const square = this.grid[c][start.r];
  				square.state = BOARD_STATE.FILLED;

  				list.push(square);
  				if (end.c == c) {
  					return list;
  				}
  			}
  			throw Error("Col Out of Bounds");
  		} else {
  			throw Error("Invalid Orientation");
  		}
  	} catch (err) {
  		return false;
  	}
  }

  updateShipLayout(layout: Layout, rules: Rules): Response {
  	const list = layout.list.sort((a, b) => {
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
  			if (search.t == cur.t) {
  				const squareList = this.getSquareList(cur, search);
  				if (squareList) {
  					const ship = new Ship(cur.t, squareList);
  					const res = builder.add(ship);
  					if (!res.valid) {
  						return res;
  					}
  					list.splice(j, 1); //remove search from list
  					found = true;
  					break;
  				} else {
  					return new Response(false, ResponseHeader.INVALID_SHIP_MARKERS);
  				}
  			}
  		}
  		if (!found) {
  			return new Response(false, ResponseHeader.SHIP_POSITIONER_MISMATCH);
  		}
  	}
  	this.ships = builder.fleet;
  	this.updateView();
  	return new Response(true, ResponseHeader.SHIP_POSITIONED);
  }
}

export enum BOARD_STATE {
  EMPTY = " ",
  FILLED = "F",
  HIT = "H",
  MISS = "M",
}

/**
 * Checks If Move can be made, i.e. someone hasn't already made
 * a move on this square
 * @param square - square being checked
 * @returns true if move can be made, false otherwise
 */
export function MoveAllowed(square: Square): boolean {
	if (
		square.state === BOARD_STATE.EMPTY ||
    square.state === BOARD_STATE.FILLED
	) {
		return true;
	} else {
		return false;
	}
}

export enum ERRORS {
  INVALID_SHIP_POINTS = "INVALID SHIP POINTS",
}

// export enum TYPE {
// 	DEFAULT = "DEFAULT",
// 	SMALL = "SMALL",
// 	INVALID = "INVALID",
// }
export class Square {
  state: BOARD_STATE;
  c: number;
  r: number;

  constructor(c: number, r: number) {
  	this.c = c;
  	this.r = r;
  	this.state = BOARD_STATE.EMPTY; //default
  }

  hit() {
  	this.state = BOARD_STATE.HIT;
  }

  miss() {
  	this.state = BOARD_STATE.MISS;
  }
}
