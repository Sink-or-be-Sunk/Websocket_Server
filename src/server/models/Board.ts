class Board {
	id: string;
	grid: Board.Square[][];
	size: number;

	constructor(id: string, size: number) {
		this.id = id;
		this.size = size;
		this.grid = this.initGrid();
	}

	private initGrid() {
		const grid = new Array<Array<Board.Square>>();
		for (let c = 0; c < this.size; c++) {
			grid[c] = [];
			for (let r = 0; r < this.size; r++) {
				grid[c][r] = new Board.Square();
			}
		}
		return grid;
	}

	show() {
		console.log(`Board <${this.id}>:`);
		for (let c = 0; c < this.size; c++) {
			for (let r = 0; r < this.size; r++) {
				this.grid[c][r].show();
			}
			console.log();
		}
	}

	makeMove(move: string) {
		// if (Moves.isValidMove(move)) {
		// 	console.log("valid");
		// } else {
		// 	console.log(move, "invalid");
		// }
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

		constructor() {
			this.state = Board.STATE.EMPTY; //default
		}

		show() {
			process.stdout.write(this.state + ", ");
		}

		changeState() {}
	}
}

export default Board;
