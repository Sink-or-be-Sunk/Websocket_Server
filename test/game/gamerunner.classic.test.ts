import { GAME_TYPE } from "../../src/models/gameplay/Game";
import { GameRunner, RUNNER_POSITION } from "../../testUtils/GameRunner";

describe("Validate GameRunner Match with Player1 Winning", () => {
	const e = RUNNER_POSITION.E;
	const P = RUNNER_POSITION.P;
	const S = RUNNER_POSITION.S;
	const D = RUNNER_POSITION.D;
	const B = RUNNER_POSITION.B;
	const C = RUNNER_POSITION.C;

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
		GAME_TYPE.CLASSIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(0); //first player wins
});

describe("Validate GameRunner Match with Player2 Winning", () => {
	const e = RUNNER_POSITION.E;
	const P = RUNNER_POSITION.P;
	const S = RUNNER_POSITION.S;
	const D = RUNNER_POSITION.D;
	const B = RUNNER_POSITION.B;
	const C = RUNNER_POSITION.C;

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
		GAME_TYPE.CLASSIC,
		boards,
	);

	runner.addPlayers();

	runner.setLayouts();

	runner.makeMoves(1); //second player wins
});
