import { Request, Response, NextFunction } from "express";
import path from "path";
import logger from "../util/logger";
import { body, check, validationResult } from "express-validator";
import { lobby } from "../singletons";

const server_action_list = [
	{
		t: "End All Games",
		f: () => {
			lobby.clear();
		},
	},
];

/**
 * Connect page.
 * @route GET /admin/log
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

/**
 * Connect page.
 * @route GET /admin/console
 */
export const getAdminConsole = (req: Request, res: Response) => {
	res.render("admin/console", {
		title: "Admin Console",
		actions: server_action_list,
	});
};

/**
 * Connect page.
 * @route POST /admin/action
 */
export const postAction = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	for (let i = 0; i < server_action_list.length; i++) {
		const action = server_action_list[i];
		if (action.t == req.body.action) {
			logger.warn(`Admin Action Requested: ${action.t}`);
			action.f();
			req.flash("success", { msg: "Action Complete!" });
			return res.redirect("/admin/console");
		}
	}
	req.flash("error", { msg: "Invalid Action" });
	return res.redirect("/admin/console");
};
