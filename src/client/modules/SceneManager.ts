import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky";
import { Water } from "three/examples/jsm/objects/Water";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BoatManager from "./BoatManager";
import Positioner from "./Positioner";
import InteractionManager from "./InteractionManager";
import SquareManager from "./SquareManager";
import OverlayManager from "./OverlayManager";

export default class SceneManager {
	grid: number;
	positioner: Positioner;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	sky: Sky;
	sun: THREE.Vector3;
	boatManager: BoatManager;
	squareManager: SquareManager;
	water: Water;
	interactionManager: InteractionManager;
	overlayManager: OverlayManager;
	// controls: OrbitControls;

	constructor(grid: number) {
		this.grid = grid;
		this.positioner = new Positioner(this.grid);
		this.scene = new THREE.Scene();
		this.renderer = this.createRenderer();
		this.camera = this.createCamera();
		this.sky = this.createSky();
		this.sun = this.createSun();
		this.boatManager = new BoatManager(this.scene, this.grid);
		this.squareManager = new SquareManager(this.scene, this.grid);
		this.water = this.createWater();

		this.interactionManager = new InteractionManager(this.camera);
		this.interactionManager.add(this.boatManager.getBoats());
		this.interactionManager.add(this.squareManager.getSquares());

		this.overlayManager = new OverlayManager(
			this.renderer.domElement,
			this.positioner,
			this.camera,
		);

		// this.controls = this.setOrbitControls();

		window.addEventListener("resize", () => {
			this.onWindowResize();
		});
	}

	private createRenderer() {
		const root = document.createElement("div");
		root.classList.add("game");
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
		camera.position.copy(this.positioner.camera.ship);
		camera.lookAt(this.positioner.look.ship);
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
		const azimuth = 40; //rotational positional direction of sun facing viewer

		const phi = THREE.MathUtils.degToRad(90 - elevation);
		const theta = THREE.MathUtils.degToRad(azimuth);

		sun.setFromSphericalCoords(1, phi, theta);

		this.sky.material.uniforms["sunPosition"].value.copy(sun);

		this.scene.environment = pmremGenerator.fromScene(this.scene).texture;
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
		// controls.maxPolarAngle = Math.PI * 0.495;
		controls.enablePan = true;
		// controls.target.set(0, 10, 0);
		// controls.minDistance = 40.0;
		// controls.maxDistance = 1000.0;
		// controls.update();
		this.camera.position.copy(this.positioner.camera.ship);
		this.camera.lookAt(this.positioner.look.ship);
		return controls;
	}

	public update() {
		// Animates water
		const mat = this.water.material as THREE.ShaderMaterial; //TODO: fix this in a type declaration file
		mat.uniforms["time"].value += 1.0 / 60.0;

		const time = performance.now() * 0.001;

		this.boatManager.waves(time);

		this.renderer.render(this.scene, this.camera);
	}

	private onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
