import Game from "../server/models/Game";
import Player from "../server/models/Player";
import Move from "../server/models/Move";
import TestUtils from "../utils/TestUtils";
import Layout from "../server/models/Layout";
import GameRunner from "../utils/GameRunner";
import Board from "../server/models/Board";
import Ship from "../server/models/Ship";

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
	const S = GameRunner.POSITIONS.S;
	const D = GameRunner.POSITIONS.D;
	const B = GameRunner.POSITIONS.B;
	const C = GameRunner.POSITIONS.C;

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
	const S = GameRunner.POSITIONS.S;
	const D = GameRunner.POSITIONS.D;
	const B = GameRunner.POSITIONS.B;
	const C = GameRunner.POSITIONS.C;

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
