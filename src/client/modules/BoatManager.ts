import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";
import Ship from "./Ship";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class BoatManager {
	scene: THREE.Scene;
	grid: number;
	boats: THREE.Mesh[][];
	ships: Ship[];

	constructor(scene: THREE.Scene, grid: number) {
		this.scene = scene;
		this.grid = grid;
		this.ships = [];
		this.boats = this.createBoats();

		this.loadBoat();
	}

	loadBoat() {
		const loader = new GLTFLoader();

		loader.load(
			"assets/models/scharnhorst/scene.gltf",
			(gltf) => {
				console.log(gltf.scene.children);

				const ship = new Ship(gltf.scene.children[0]);
				this.scene.add(ship.mesh);

				const ambient = new THREE.HemisphereLight(
					0xffeeb1,
					0x080820,
					0.75,
				);
				this.scene.add(ambient);

				const dirLight = new THREE.DirectionalLight(0xffddcc, 4);
				dirLight.castShadow = true;
				dirLight.position.copy(
					Transform.tv(
						Statics.GRID_SPACING * -1,
						Statics.GRID_SPACING * 8,
						Statics.GRID_SPACING * 1,
					),
				);
				const lightTarget = new THREE.Object3D();
				this.scene.add(lightTarget);
				lightTarget.position.copy(
					Transform.tv(
						Statics.GRID_SPACING * 3,
						Statics.GRID_SPACING * 3,
						0,
					),
				);
				dirLight.target = lightTarget;
				dirLight.shadow.bias = -0.0075;
				dirLight.shadow.camera.near = 1;
				dirLight.shadow.camera.far = Statics.GRID_SPACING * 12;

				dirLight.shadow.camera.top = Statics.GRID_SPACING * 2;
				dirLight.shadow.camera.right = Statics.GRID_SPACING * 5;
				dirLight.shadow.camera.left = Statics.GRID_SPACING * -7;
				dirLight.shadow.camera.bottom = Statics.GRID_SPACING * -1;
				dirLight.shadow.radius = 3; //blur edges of shadow

				// this.scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

				this.scene.add(dirLight);

				// const helper = new THREE.DirectionalLightHelper(dirLight, 100);
				// this.scene.add(helper);

				this.ships.push(ship);
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
		// this.scene.add(boat);

		return boat;
	}

	waves(time: number) {
		const intensity = 8;
		const freq = 1.75;

		this.ships[0]?.wave(time);

		for (let c = 0; c < this.grid; c++) {
			for (let r = 0; r < this.grid; r++) {
				this.boats[c][r].position.y =
					Math.sin(freq * time + c - r) * intensity;
			}
		}
	}
}
