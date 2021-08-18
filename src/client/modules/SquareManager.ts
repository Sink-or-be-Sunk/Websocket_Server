import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

export default class SquareManager {
	scene: THREE.Scene;
	grid: number;
	// shipSquares: THREE.Mesh[][];
	attackSquares: THREE.Mesh[][];
	shipOutline: THREE.GridHelper;
	attackOutline: THREE.GridHelper;
	attackDist: number;

	constructor(scene: THREE.Scene, grid: number) {
		this.scene = scene;
		this.grid = grid;
		this.attackDist = 2 * Statics.GRID_SPACING * this.grid;
		// this.shipSquares = this.createShipSquares();
		this.shipOutline = this.createShipOutline();
		this.attackSquares = this.createAttackSquares();
		this.attackOutline = this.createAttackOutline();
	}

	getSquares() {
		const list = [];
		for (let c = 0; c < this.grid; c++) {
			for (let r = 0; r < this.grid; r++) {
				// list.push(this.shipSquares[c][r]); //FIXME: NEED TO REMOVE THIS
				list.push(this.attackSquares[c][r]);
			}
		}
		return list;
	}

	private createSquare(x: number, y: number, z: number): THREE.Mesh {
		const geometry = new THREE.PlaneGeometry(
			Statics.GRID_SPACING,
			Statics.GRID_SPACING,
		);
		const material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.05,
		});

		const plane = new THREE.Mesh(geometry, material);

		plane.position.copy(Transform.tv(x, y, z));
		this.scene.add(plane);
		return plane;
	}

	private createAttackSquares() {
		const array = new Array<Array<THREE.Mesh>>(this.grid);
		for (let c = 0; c < this.grid; c++) {
			array[c] = [];
			for (let r = 0; r < this.grid; r++) {
				const plane = this.createSquare(
					c * Statics.GRID_SPACING,
					this.attackDist,
					(r + 1) * Statics.GRID_SPACING,
				);
				plane.rotation.y = Math.PI; //rotates plane flat

				array[c][r] = plane;
			}
		}
		return array;
	}

	private createOutline() {
		const gridHelper = new THREE.GridHelper(
			this.grid * Statics.GRID_SPACING,
			this.grid,
		);
		const mid = Statics.calcMid(this.grid);
		gridHelper.position.copy(Transform.tv(mid, mid, 10));
		this.scene.add(gridHelper);
		return gridHelper;
	}

	private createShipOutline() {
		return this.createOutline();
	}

	private createAttackOutline() {
		const outline = this.createOutline();
		outline.rotation.x = Math.PI / 2;
		outline.position.copy(
			Transform.tv(
				Statics.calcMid(this.grid),
				this.attackDist,
				Statics.calcMid(this.grid) + Statics.GRID_SPACING,
			),
		);
		return outline;
	}
}
