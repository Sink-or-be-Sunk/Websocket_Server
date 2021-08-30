import Game from "../src/server/gameflow/Game";
import TestUtils from "../utils/TestUtils";
import GameRunner from "../utils/GameRunner";

const utils = new TestUtils();
TestUtils.silenceLog();

beforeAll(async () => {
	await utils.setup();
});

afterAll(async () => {
	await utils.tearDown();
});

describe("Validate GameRunner Match with Player1 Winning", () => {
	const e = GameRunner.POSITIONS.E;
	const P = GameRunner.POSITIONS.P;
	const S = GameRunner.POSITIONS.S;
	const D = GameRunner.POSITIONS.D;
	const B = GameRunner.POSITIONS.B;
	const C = GameRunner.POSITIONS.C;

	const b1 = [
		[e, e, e, e, e, e, e, e],
		[e, e, e, e, e, e, e, B],
		[e, e, e, e, e, C, e, e],
		[S, e, S, e, e, e, e, e],
		[e, e, e, e, e, e, e, B],
		[e, e, D, e, D, e, e, e],
		[e, P, P, e, e, C, e, e],
		[e, e, e, e, e, e, e, e],
	];
	const b2 = [
		[C, e, e, e, e, e, e, e],
		[e, e, e, S, e, S, e, e],
		[e, e, e, e, e, e, e, e],
		[e, e, e, e, B, e, e, B],
		[C, e, e, e, e, e, e, e],
		[e, e, e, P, e, D, e, e],
		[e, e, e, P, e, e, e, e],
		[e, e, e, e, e, D, e, e],
	];
	const boards = [b1, b2];

	const runner = new GameRunner(
		utils.getSocket("one"),
		Game.TYPE.CLASSIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(0); //first player wins
});

describe("Validate GameRunner Match with Player2 Winning", () => {
	const e = GameRunner.POSITIONS.E;
	const P = GameRunner.POSITIONS.P;
	const S = GameRunner.POSITIONS.S;
	const D = GameRunner.POSITIONS.D;
	const B = GameRunner.POSITIONS.B;
	const C = GameRunner.POSITIONS.C;

	const b1 = [
		[e, e, e, e, e, e, e, e],
		[e, e, e, e, e, e, e, e],
		[e, e, e, e, e, e, B, e],
		[e, e, P, e, S, e, e, e],
		[e, e, P, e, e, e, e, e],
		[e, e, e, e, S, e, B, e],
		[e, e, C, e, e, e, C, e],
		[e, e, e, e, e, e, e, e],
	];
	const b2 = [
		[e, e, e, e, e, e, e, e],
		[e, e, e, e, e, e, e, e],
		[e, C, e, e, e, e, P, e],
		[e, e, B, e, e, e, P, e],
		[e, e, e, e, e, S, D, e],
		[e, e, e, e, e, e, e, e],
		[e, C, B, e, e, S, D, e],
		[e, e, e, e, e, e, e, e],
	];
	const boards = [b1, b2];

	const runner = new GameRunner(
		utils.getSocket("one"),
		Game.TYPE.CLASSIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(1); //second player wins
});
