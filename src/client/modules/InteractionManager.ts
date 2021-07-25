import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import * as Statics from "./Statics";

export default class InteractionManager {
	private camera: THREE.Camera;
	private raycaster = new THREE.Raycaster();
	private domElements = document;
	private objects: THREE.Mesh[];
	private active: THREE.Mesh[];

	constructor(camera: THREE.Camera) {
		this.camera = camera;
		this.createListeners();
		this.objects = [];
		this.active = [];
	}

	add(object: THREE.Mesh[]) {
		this.objects.push(...object);
	}

	createListeners() {
		this.domElements.addEventListener(
			"mousemove",
			(event) => {
				this.updateObjects(event);
			},
			false,
		);
	}

	clear() {
		for (let i = 0; i < this.objects.length; i++) {
			const object = this.objects[i];
			const material = object.material as Statics.OBJECT_MATERIAL;
			material.color.set(0xffffff);
		}
	}

	updateObjects(event: MouseEvent) {
		const mouse = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);
		const intersections = this.raycaster.intersectObjects(this.objects);

		this.clear();
		for (let i = 0; i < intersections.length; i++) {
			const intersection = intersections[i].object as THREE.Mesh;
			this.active.push(intersection);
			const material = intersection.material as Statics.OBJECT_MATERIAL;
			material.color.set(0xff0000);
			const cur = { z: 50 }; //TODO: May want to remove this?
			new TWEEN.Tween(cur)
				.to({ z: 20 })
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					intersection.position.y = cur.z;
				})
				.start();
		}
	}
}
