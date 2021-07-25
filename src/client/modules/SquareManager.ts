import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

export default class SquareManager {
	scene: THREE.Scene;
	grid: number;
	squares: THREE.Mesh[][];
	outline: THREE.GridHelper;

	constructor(scene: THREE.Scene, grid: number) {
		this.scene = scene;
		this.grid = grid;
		this.squares = this.createSquares();
		this.outline = this.createOutline();
	}

	getSquares() {
		const list = [];
		for (let c = 0; c < this.grid; c++) {
			for (let r = 0; r < this.grid; r++) {
				list.push(this.squares[c][r]);
			}
		}
		return list;
	}
	private createSquares() {
		const array = new Array<Array<THREE.Mesh>>(this.grid);
		for (let c = 0; c < this.grid; c++) {
			array[c] = [];
			for (let r = 0; r < this.grid; r++) {
				array[c][r] = this.createSquare(
					c * Statics.GRID_SPACING,
					r * Statics.GRID_SPACING,
				);
			}
		}
		return array;
	}

	private createSquare(x: number, y: number): THREE.Mesh {
		const geometry = new THREE.PlaneGeometry(
			Statics.GRID_SPACING,
			Statics.GRID_SPACING,
		);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.05,
		});

		const plane = new THREE.Mesh(geometry, material);
		plane.rotation.x = -Math.PI / 2; //rotates plane flat

		plane.position.copy(Transform.tv(x, y, 10));
		this.scene.add(plane);
		return plane;
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
}
