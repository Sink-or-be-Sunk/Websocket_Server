import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import logger from "../util/logger";

/**
 * Connect page.
 * @route GET /connect
 */
export const getLog = (req: Request, res: Response) => {
	try {
		const p = path.resolve(__dirname, "../..", "debug.log");
		return res.sendFile(p);
	} catch (err) {
		logger.error(err);
		return res.send("Server Error!");
	}
};
