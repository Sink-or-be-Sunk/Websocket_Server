import { Request, Response } from "express";

/**
 * Game page.
 * @route GET /game
 */
export const getGame = (req: Request, res: Response) => {
	res.render("game/game3D", {
		title: "Game 3D",
	});
};

//TODO: REMOVE THIS ROUTE, FOR TESTING ONLY
/**
 * game messenger page.
 * @route GET /messenger
 */
export const getGameMessenger = (req: Request, res: Response) => {
	res.render("game/game2D", {
		title: "Game 2D",
	});
};
