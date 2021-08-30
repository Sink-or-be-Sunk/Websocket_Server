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
	const E = GameRunner.POSITIONS.E;
	const P = GameRunner.POSITIONS.P;
	const D = GameRunner.POSITIONS.D;

	const b1 = [
		[E, E, E, E, E, E],
		[E, E, E, E, E, E],
		[E, P, E, D, E, E],
		[E, P, E, E, E, E],
		[E, E, E, D, E, E],
		[E, E, E, E, E, E],
	];
	const b2 = [
		[E, E, E, E, E, E],
		[E, E, E, E, E, E],
		[E, E, D, E, D, E],
		[E, P, P, E, E, E],
		[E, E, E, E, E, E],
		[E, E, E, E, E, E],
	];
	const boards = [b1, b2];

	const runner = new GameRunner(
		utils.getSocket("one"),
		Game.TYPE.BASIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(0); //first player wins
});

describe("Validate GameRunner Match with Player2 Winning", () => {
	const E = GameRunner.POSITIONS.E;
	const P = GameRunner.POSITIONS.P;
	const D = GameRunner.POSITIONS.D;

	const b1 = [
		[E, E, E, E, P, P],
		[E, E, E, E, E, D],
		[E, E, E, E, E, E],
		[E, E, E, E, E, D],
		[E, E, E, E, E, E],
		[E, E, E, E, E, E],
	];
	const b2 = [
		[E, E, D, E, E, E],
		[E, E, E, E, E, E],
		[E, E, D, E, E, E],
		[E, E, P, E, E, E],
		[E, E, P, E, E, E],
		[E, E, E, E, E, E],
	];
	const boards = [b1, b2];

	const runner = new GameRunner(
		utils.getSocket("one"),
		Game.TYPE.BASIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(1); //second player wins
});
