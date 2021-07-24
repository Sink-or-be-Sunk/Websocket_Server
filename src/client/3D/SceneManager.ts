import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky";
import { Water } from "three/examples/jsm/objects/Water";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import BOATS from "./createBoats";

export default class SceneManager {
	grid: number;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	sky: Sky;
	sun: THREE.Vector3;
	boats: THREE.Mesh[][];
	controls: OrbitControls;
	water: Water;

	constructor(grid: number) {
		this.grid = grid;
		this.scene = new THREE.Scene();
		this.renderer = this.createRenderer();
		this.camera = this.createCamera();
		this.sky = this.createSky();
		this.sun = this.createSun();
		this.boats = BOATS.createBoats(this.scene, this.grid);
		this.controls = this.setOrbitControls();
		this.water = this.createWater();

		window.addEventListener("resize", () => {
			this.onWindowResize();
		});
	}

	private createRenderer() {
		const root = document.createElement("div");
		document.body.appendChild(root);
		// const renderer = new THREE.WebGLRenderer({ antialias: true });
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		root.appendChild(renderer.domElement);
		return renderer;
	}

	private createCamera() {
		const camera = new THREE.PerspectiveCamera(
			55,
			window.innerWidth / window.innerHeight,
			1,
			20000,
		);
		camera.position.set(300, 420, -540);
		return camera;
	}

	private createSky() {
		const sky = new Sky();
		sky.scale.setScalar(450000);
		this.scene.add(sky);
		return sky;
	}

	private createSun() {
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

		const sun = new THREE.Vector3();

		const uniforms = this.sky.material.uniforms;
		uniforms["turbidity"].value = 2;
		uniforms["rayleigh"].value = 1;
		uniforms["mieCoefficient"].value = 0.001;
		uniforms["mieDirectionalG"].value = 0.8;

		const elevation = 2; //distance into sky
		const azimuth = 0; //rotational positional direction of sun facing viewer

		const phi = THREE.MathUtils.degToRad(90 - elevation);
		const theta = THREE.MathUtils.degToRad(azimuth);

		sun.setFromSphericalCoords(1, phi, theta);

		this.sky.material.uniforms["sunPosition"].value.copy(sun);

		// this.scene.environment = pmremGenerator.fromScene(this.sky).texture; //TODO: add back
		return sun;
	}

	private createWater() {
		const waterGeometry = new THREE.PlaneGeometry(100000, 100000);
		const water = new Water(waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load(
				"https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg",
				function (texture) {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				},
			),
			alpha: 1.0,
			sunDirection: new THREE.Vector3(this.sun.x, this.sun.y, this.sun.z),
			sunColor: 0xffffff, //not sure this does anything
			waterColor: 0x001e0f,
			distortionScale: 3.7, //amount of distortion in water reflection
			fog: this.scene.fog !== undefined,
		});
		water.rotation.x = -Math.PI / 2; //rotates water flat
		this.scene.add(water);
		return water;
	}

	private setOrbitControls() {
		const controls = new OrbitControls(
			this.camera,
			this.renderer.domElement,
		);
		controls.maxPolarAngle = Math.PI * 0.495;
		controls.enablePan = true;
		controls.target.set(0, 10, 0);
		controls.minDistance = 40.0;
		controls.maxDistance = 1000.0;
		controls.update();
		return controls;
	}

	public update() {
		// Animates water
		// this.water.material.uniforms["time"].value += 1.0 / 60.0; //TODO: add back

		const time = performance.now() * 0.001;

		// for (const boat of this.boats) {
		//     console.log(boat);
		//     // this.boat.position.y = Math.sin(time) * 2;
		//     // this.boat.rotation.x = time * 0.3;
		//     // this.boat.rotation.z = time * 0.3;
		// }

		this.renderer.render(this.scene, this.camera);
	}

	private onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
