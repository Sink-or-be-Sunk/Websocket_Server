import { Request, Response } from "express";
import { WSClientMessage, REQ_TYPE } from "../util/WSClientMessage";
import { RegistrationManager } from "../models/registration/RegistrationManager";
import { REGISTER_TYPE } from "../models/registration/RegisterRequest";
import { body, check, validationResult } from "express-validator";

/**
 * Connect page.
 * @route GET /connect
 */
export const getConnect = (req: Request, res: Response) => {
	// const manager = RegistrationManager.getInstance();
	// const register = { type: REGISTER_TYPE.INIT, ssid: "my test wifi ssid" };
	// const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
	// const msg = new WSClientMessage(JSON.stringify(obj));
	// const resp = manager.handleReq(msg); //TODO: REMOVE ABOVE: FOR TESTING ONLY

	// const pending = manager.getPending();
	// const list = Array.from(pending, ([id, value]) => ({ id, ...value }));
	const list = [];
	res.render("connect", {
		title: "Connect",
		list: list,
	});
};

// /**
//  * Starts Device Connect/Pairing Process
//  * @route POST /connect
//  */
// export const postConnectDeviceAction = async (
// 	req: Request,
// 	res: Response,
// 	next: NextFunction,
// ): Promise<void> => {
// 	const manager = RegistrationManager.getInstance();
// 	const pending = manager.getPending();
// 	const pendingList = Array.from(pending, ([id, value]) => id);

// 	await check("id", "Invalid Device ID").isIn(pendingList).run(req);

// 	const errors = validationResult(req);

// 	if (!errors.isEmpty()) {
// 		req.flash("errors", errors.array());
// 		return res.redirect("/connect");
// 	}
// 	const id = req.body.id;
// 	const registerRequest = RegistrationManager.buildObj();
// 	manager.handleRegister(id, register);
// 	return res.redirect("/connect");

// 	// const user = req.user as UserDocument;
// 	// User.findById(user.id, (err: NativeError, user: UserDocument) => {
// 	// 	if (err) {
// 	// 		return next(err);
// 	// 	}
// 	// 	user.email = req.body.email || "";
// 	// 	user.username = req.body.username || "";
// 	// 	user.profile.name = req.body.name || "";
// 	// 	user.profile.device = req.body.device || "";
// 	// 	user.save((err: WriteError & CallbackError) => {
// 	// 		if (err) {
// 	// 			if (err.code === 11000) {
// 	// 				req.flash("errors", {
// 	// 					msg: "The email or username you have entered is already associated with an account.",
// 	// 				});
// 	// 				return res.redirect("/account");
// 	// 			}
// 	// 			return next(err);
// 	// 		}
// 	// 		req.flash("success", {
// 	// 			msg: "Profile information has been updated.",
// 	// 		});
// 	// 		res.redirect("/account");
// 	// 	});
// 	// });
// };
