import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

export default class OverlayManager {
	scene: THREE.Scene;
	camera: THREE.Camera;
	objects: { top: THREE.Group; bottom: THREE.Group };
	loader: SVGLoader;

	constructor(scene: THREE.Scene, camera: THREE.Camera) {
		this.scene = scene;
		this.camera = camera;
		this.loader = new SVGLoader();
		this.objects = this.createOverlay();
	}

	getObjects() {
		return this.objects;
	}

	private createOverlay() {
		return { top: this.createUpArrow(), bottom: this.createUpArrow() };
	}

	private updateOverlay() {
		const base = new THREE.Vector3(0, 0, -1);
		base.applyQuaternion(this.camera.quaternion);
		// console.log(Transform.decode(offset));
		// console.log(Transform.decode(this.camera.position));
		base.multiplyScalar(70); //"shrink" shape
		base.add(Transform.tv(-20, 0, 0)); //account for svg positioning offset (width/2)
		base.add(this.camera.position);

		const vertical = new THREE.Vector3(1, 0, 0);
		vertical.cross(base).normalize();
		const top = new THREE.Vector3().copy(vertical).multiplyScalar(29);
		const bottom = new THREE.Vector3().copy(vertical).multiplyScalar(-33);

		this.objects.top.position.copy(
			new THREE.Vector3().addVectors(base, top),
		);
		this.objects.bottom.position.copy(
			new THREE.Vector3().addVectors(base, bottom),
		);

		//update rotation towards camera
		this.objects.top.quaternion.copy(this.camera.quaternion);
		this.objects.bottom.quaternion.copy(this.camera.quaternion);
	}
	private createUpArrow() {
		const group = new THREE.Group();
		this.loader.load(
			"assets/svg/upArrow.svg",
			(data) => {
				const paths = data.paths;

				for (let i = 0; i < paths.length; i++) {
					const path = paths[i];
					const material = new THREE.MeshStandardMaterial({
						color: path.color,
						// side: THREE.DoubleSide,
						depthWrite: false,
					});

					const shapes = SVGLoader.createShapes(path);

					for (let j = 0; j < shapes.length; j++) {
						const shape = shapes[j];
						const geometry = new THREE.ShapeGeometry(shape);
						const mesh = new THREE.Mesh(geometry, material);
						group.add(mesh);
					}
				}
				this.updateOverlay();
				this.scene.add(group);
			},
			// called when loading is in progresses
			function (xhr) {
				console.info((xhr.loaded / xhr.total) * 100 + "% loaded");
			},
			// called when loading has errors
			function (error) {
				console.error("Error: ", error);
			},
		);
		return group;
	}
}
