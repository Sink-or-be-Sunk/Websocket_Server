// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { username: username }; //ts throws error because username is located in html page script tag

const game = new GameSocket(client.username);

function clickAttack(button: string) {
	console.log(button);
	const parse = button.split(",");
	const r = parseInt(parse[0]);
	const c = parseInt(parse[1]);
	const opponent = $("#opponent").val() as string;
	game.sendMakeMove({ r: r, c: c, type: "SOLO", to: opponent });
}
let positionQueue = [];
const positionList = [];

function togglePosition(button: HTMLButtonElement) {
	console.log(button);
	$(button).toggleClass("btn-success");
	const parse = button.id.split(",");
	const r = parseInt(parse[0]);
	const c = parseInt(parse[1]);
	positionQueue.push({ r: r, c: c });
}

function addShip() {
	//TODO: ADD CHECKS FOR VALID SHIPS
	const p1 = positionQueue[0];
	const p2 = positionQueue[1];
	let size = p1.r - p2.r == 0 ? p1.c - p2.c - 1 : p1.r - p2.r - 1;
	size = Math.abs(size);
	let t = "error";
	if (size == 2) {
		t = "P";
	} else if (size == 3) {
		t = "S";
	} else if (size == 4) {
		t = "B";
	} else if (size == 5) {
		t = "C";
	}
	p1.t = t;
	p2.t = t;
	console.info("Adding Ships:");
	console.info(p1);
	console.info(p2);
	positionList.push(p1, p2);
	positionQueue = [];
}

function clickPositionShips() {
	game.sendShipPositions(positionList);
}
