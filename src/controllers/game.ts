import { Request, Response } from "express";

/**
 * Home page.
 * @route GET /
 */
export const getGame = (req: Request, res: Response) => {
	res.render("game", {
		title: "Game"
	});
};
