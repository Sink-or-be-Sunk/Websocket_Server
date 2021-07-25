import * as THREE from "three";

export default class Transform {
	static tv(x: number, y: number, z: number) {
		return new THREE.Vector3(-x, z, y);
	}
	static decode(v: THREE.Vector3 | THREE.Euler) {
		return new THREE.Vector3(-v.x, v.z, v.y);
	}
}
