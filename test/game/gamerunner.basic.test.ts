import { GAME_TYPE } from "../../src/models/gameplay/Game";
import TestUtils from "../../testUtils/TestUtils";
import { GameRunner, RUNNER_POSITION } from "../../testUtils/GameRunner";

const utils = new TestUtils();
TestUtils.silenceLog();

beforeAll(async () => {
	await utils.setup();
});

afterAll(async () => {
	await utils.tearDown();
});

describe("Validate GameRunner Match with Player1 Winning", () => {
	const E = RUNNER_POSITION.E;
	const P = RUNNER_POSITION.P;
	const D = RUNNER_POSITION.D;

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
		GAME_TYPE.BASIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(0); //first player wins
});

describe("Validate GameRunner Match with Player2 Winning", () => {
	const E = RUNNER_POSITION.E;
	const P = RUNNER_POSITION.P;
	const D = RUNNER_POSITION.D;

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
		GAME_TYPE.BASIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(1); //second player wins
});
