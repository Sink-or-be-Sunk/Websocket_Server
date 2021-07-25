import SceneManager from "./3D/SceneManager";
import * as TWEEN from "@tweenjs/tween.js";

const sceneManager = new SceneManager(3);

animate((time: number) => {
	sceneManager.update();
	TWEEN.update(time);
});

function animate(callback: (time: number) => void) {
	function loop(time: number) {
		callback(time);
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}
