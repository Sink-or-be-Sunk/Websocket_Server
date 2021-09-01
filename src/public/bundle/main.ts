import SceneManager from "./modules/SceneManager";
import * as TWEEN from "@tweenjs/tween.js";

const sceneManager = new SceneManager(8);

// document.addEventListener("click", (event) => {
// 	event.stopPropagation();
// 	sceneManager.transition();
// });

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