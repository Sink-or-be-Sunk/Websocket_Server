// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const client = { username: username }; //ts throws error because username is located in html page script tag

const game = new GameSocket(client.username);

class Game2D {
	socket: GameSocket;

	constructor(socket: GameSocket) {
		this.socket = socket;
	}

	public clickAttack(button: string) {
		console.log(button);
		const parse = button.split(",");
		const r = parseInt(parse[0]);
		const c = parseInt(parse[1]);
		const opponent = $("#opponent").val() as string;
		game.sendMakeMove({ r: r, c: c, type: "SOLO", to: opponent });
	}
}
