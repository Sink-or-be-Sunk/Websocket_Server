import * as THREE from "three";

export default class Transform {
	static tv(x: number, y: number, z: number) {
		return new THREE.Vector3(-x, z, y);
	}
}
