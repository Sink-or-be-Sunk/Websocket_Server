import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class BoatManager {
	scene: THREE.Scene;
	grid: number;
	boats: THREE.Mesh[][];

	constructor(scene: THREE.Scene, grid: number) {
		this.scene = scene;
		this.grid = grid;
		this.boats = this.createBoats();
		this.loadBoat();
	}

	loadBoat() {
		const loader = new GLTFLoader();

		loader.load(
			"assets/models/scharnhorst/scene.gltf",
			(gltf) => {
				this.scene.add(gltf.scene);
			},
			undefined,
			function (error) {
				console.error(error);
			},
		);
	}

	getBoats() {
		const boatList = [];
		for (let c = 0; c < this.grid; c++) {
			for (let r = 0; r < this.grid; r++) {
				boatList.push(this.boats[c][r]);
			}
		}
		return boatList;
	}
	private createBoats() {
		const boats = new Array<Array<THREE.Mesh>>(this.grid);
		for (let c = 0; c < this.grid; c++) {
			boats[c] = [];
			for (let r = 0; r < this.grid; r++) {
				boats[c][r] = this.createBoat(
					c * Statics.GRID_SPACING,
					r * Statics.GRID_SPACING,
				);
			}
		}
		return boats;
	}

	private createBoat(x: number, y: number): THREE.Mesh {
		const geometry = new THREE.SphereGeometry(30, 20, 20);
		const material = new THREE.MeshStandardMaterial({
			color: 0xd3e1e6,
		});

		const boat = new THREE.Mesh(geometry, material);
		boat.position.copy(Transform.tv(x, y, 0));
		this.scene.add(boat);
		return boat;
	}

	waves(time: number) {
		const intensity = 8;
		const freq = 1.75;
		for (let c = 0; c < this.grid; c++) {
			for (let r = 0; r < this.grid; r++) {
				this.boats[c][r].position.y =
					Math.sin(freq * time + c - r) * intensity;
			}
		}
	}
}
