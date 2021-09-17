import { Request, Response } from "express";
import { UserDocument } from "../models/User";

/**
 * Connect page.
 * @route GET /connect
 */
export const getConnect = (req: Request, res: Response) => {
	res.render("connect", {
		title: "Connect",
	});
};
