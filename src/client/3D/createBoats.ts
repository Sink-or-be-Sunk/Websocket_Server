import * as THREE from "three";

export default class BOATS {
	static createBoats(scene: THREE.Scene, grid: number) {
		const boats = new Array<Array<THREE.Mesh>>(grid);
		for (let c = 0; c < grid; c++) {
			boats[c] = [];
			for (let r = 0; r < grid; r++) {
				boats[c][r] = BOATS.createBoat(scene, c * 20, r * 20);
			}
		}
		return boats;
	}

	static createBoat(scene: THREE.Scene, x: number, y: number): THREE.Mesh {
		const geometry = new THREE.SphereGeometry(30, 20, 20);
		const material = new THREE.MeshStandardMaterial({
			color: 0xd3e1e6,
		});

		const boat = new THREE.Mesh(geometry, material);
		boat.position.set(x, y, 0);
		scene.add(boat);
		return boat;
	}
}
