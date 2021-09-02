import { Request, Response } from "express";

/**
 * Home page.
 * @route GET /
 */
export const getConnect = (req: Request, res: Response) => {
	res.render("connect", {
		title: "Connect"
	});
};
