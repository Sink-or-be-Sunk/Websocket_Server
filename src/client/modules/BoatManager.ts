import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";
import Ship from "./Ship";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class BoatManager {
	scene: THREE.Scene;
	grid: number;
	ships: Ship[];

	static assets = [
		new Ship.Config("elco_80ft_pt", 10, -5, 200, 2),
		new Ship.Config("u-557", 13.25, 8, 0, 3),
		new Ship.Config("z-39", 7.1, 5, 0, 3),
		new Ship.Config("scharnhorst", 5, 7, 0, 4),
		new Ship.Config("enterprise", 5.9, 0, 0, 5),
	];

	constructor(scene: THREE.Scene, grid: number) {
		this.scene = scene;
		this.grid = grid;
		this.ships = [];

		this.loadBoats();
		this.addShipLights();
	}

	private addShipLights() {
		const ambient = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.75);
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
			Transform.tv(Statics.GRID_SPACING * 3, Statics.GRID_SPACING * 3, 0),
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
	}

	loadBoats() {
		const loader = new GLTFLoader();

		for (let c = 0; c < BoatManager.assets.length; c++) {
			const config = BoatManager.assets[c];

			const ship = new Ship(config);

			loader.load(
				`assets/models/${config.path}/scene.gltf`,
				(gltf) => {
					const mesh = gltf.scene.children[0];
					ship.add3D(mesh, c, 0);
					this.scene.add(mesh);
				},
				undefined,
				function (error) {
					console.error(error);
				},
			);

			for (let r = 0; r < config.num_squares; r++) {
				const square = this.createShipSquare(
					c * Statics.GRID_SPACING,
					r * Statics.GRID_SPACING,
					10,
				);
				ship.addSquare(square);
			}

			this.ships.push(ship);
		}
	}

	private createShipSquare(x: number, y: number, z: number): THREE.Mesh {
		const geometry = new THREE.PlaneGeometry(
			Statics.GRID_SPACING,
			Statics.GRID_SPACING,
		);
		const material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.05,
			color: 0x0000ff,
		});

		const plane = new THREE.Mesh(geometry, material);
		plane.rotation.x = -Math.PI / 2; //rotates plane flat

		plane.position.copy(Transform.tv(x, y, z));
		this.scene.add(plane);
		return plane;
	}

	waves(time: number) {
		const intensity = 8;
		const freq = 1.75;

		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			ship.wave(time + i);
		}
	}
}
