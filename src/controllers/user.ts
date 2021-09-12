import async from "async";
import crypto from "crypto";
import passport from "passport";
import { User, UserDocument, AuthToken, USERNAME_REGEX } from "../models/User";
import { Friend, FriendDocument, FriendStatus } from "../models/Friend";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { body, check, validationResult } from "express-validator";
import "../config/passport";
import { CallbackError, NativeError } from "mongoose";
import logger from "../util/logger";
import sgMail from "@sendgrid/mail";
import mongoose from "mongoose";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = (req: Request, res: Response): void => {
	if (req.user) {
		return res.redirect("/");
	}
	res.render("account/login", {
		title: "Login",
	});
};

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("email", "Email is not valid").isEmail().run(req);
	await check("password", "Password cannot be blank")
		.isLength({ min: 1 })
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/login");
	}

	passport.authenticate(
		"local",
		(err: Error, user: UserDocument, info: IVerifyOptions) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				req.flash("errors", { msg: info.message });
				return res.redirect("/login");
			}
			req.logIn(user, (err) => {
				if (err) {
					return next(err);
				}
				req.flash("success", { msg: "Success! You are logged in." });
				res.redirect(req.session.returnTo || "/");
			});
		},
	)(req, res, next);
};

/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response): void => {
	req.logout();
	res.redirect("/");
};

/**
 * Signup page.
 * @route GET /signup
 */
export const getSignup = (req: Request, res: Response): void => {
	if (req.user) {
		return res.redirect("/");
	}
	res.render("account/signup", {
		title: "Create Account",
	});
};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("email", "Email is not valid").isEmail().run(req);
	await check("password", "Password must be at least 4 characters long")
		.isLength({ min: 4 })
		.run(req);
	await check("confirmPassword", "Passwords do not match")
		.equals(req.body.password)
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/signup");
	}
	const username = req.body.email.split("@")[0];

	const user = new User({
		email: req.body.email,
		username: username,
		password: req.body.password,
	});

	let validUsername = false;
	for (let timeout = 0; timeout < 100; timeout++) {
		validUsername = !(await User.exists({ username: user.username }));
		logger.debug(`timeout: ${timeout}, valid: ${validUsername}\n`);
		if (validUsername) {
			break; //found unique username
		} else {
			const rand = Math.floor(1000 + Math.random() * 9000); //random 4 digit number
			user.username = username + rand;
		}
	}
	if (!validUsername) {
		req.flash("errors", {
			msg: "Server Timeout: Please Retry.  If this issue persists please contact system administrator",
		});
		return res.redirect("/signup");
	}

	User.findOne(
		{ email: req.body.email },
		(err: NativeError, existingUser: UserDocument) => {
			if (err) {
				return next(err);
			}
			if (existingUser) {
				req.flash("errors", {
					msg: "Account with that email address already exists.",
				});
				return res.redirect("/signup");
			}
			user.save((err) => {
				if (err) {
					return next(err);
				}
				req.logIn(user, (err) => {
					if (err) {
						return next(err);
					}
					res.redirect("/");
				});
			});
		},
	);
};

/**
 * Profile page.
 * @route GET /account
 */
export const getAccount = async (
	req: Request,
	res: Response,
): Promise<void> => {
	//get info on friends

	res.render("account/profile", {
		title: "Account Management",
	});
};

/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("email", "Please enter a valid email address.")
		.isEmail()
		.run(req);
	await check("username", "Please enter a valid username")
		.matches(USERNAME_REGEX)
		.run(req);
	await check("username", "Username has a max of 32 characters")
		.isLength({ max: 32 })
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/account");
	}

	const user = req.user as UserDocument;
	User.findById(user.id, (err: NativeError, user: UserDocument) => {
		if (err) {
			return next(err);
		}
		user.email = req.body.email || "";
		user.username = req.body.username || "";
		user.profile.name = req.body.name || "";
		user.profile.device = req.body.device || "";
		user.save((err: WriteError & CallbackError) => {
			if (err) {
				if (err.code === 11000) {
					req.flash("errors", {
						msg: "The email or username you have entered is already associated with an account.",
					});
					return res.redirect("/account");
				}
				return next(err);
			}
			req.flash("success", {
				msg: "Profile information has been updated.",
			});
			res.redirect("/account");
		});
	});
};

/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("password", "Password must be at least 4 characters long")
		.isLength({ min: 4 })
		.run(req);
	await check("confirmPassword", "Passwords do not match")
		.equals(req.body.password)
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/account");
	}

	const user = req.user as UserDocument;
	User.findById(user.id, (err: NativeError, user: UserDocument) => {
		if (err) {
			return next(err);
		}
		user.password = req.body.password;
		user.save((err: WriteError & CallbackError) => {
			if (err) {
				return next(err);
			}
			req.flash("success", { msg: "Password has been changed." });
			res.redirect("/account");
		});
	});
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
export const postDeleteAccount = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const user = req.user as UserDocument;
	User.deleteOne({ _id: user.id }, undefined, (err) => {
		if (err) {
			return next(err);
		}
		req.logout();
		req.flash("info", { msg: "Your account has been deleted." });
		res.redirect("/");
	});
};

/**
 * Unlink OAuth provider.
 * @route GET /account/unlink/:provider
 */
export const getOauthUnlink = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const provider = req.params.provider;
	const user = req.user as UserDocument;
	User.findById(user.id, (err: NativeError, user: any) => {
		if (err) {
			return next(err);
		}
		user[provider] = undefined;
		user.tokens = user.tokens.filter(
			(token: AuthToken) => token.kind !== provider,
		);
		user.save((err: WriteError) => {
			if (err) {
				return next(err);
			}
			req.flash("info", {
				msg: `${provider} account has been unlinked.`,
			});
			res.redirect("/account");
		});
	});
};

/**
 * Reset Password page.
 * @route GET /reset/:token
 */
export const getReset = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	User.findOne({ passwordResetToken: req.params.token })
		.where("passwordResetExpires")
		.gt(Date.now())
		.exec((err, user) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				req.flash("errors", {
					msg: "Password reset token is invalid or has expired.",
				});
				return res.redirect("/forgot");
			}
			res.render("account/reset", {
				title: "Password Reset",
			});
		});
};

/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
export const postReset = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("password", "Password must be at least 4 characters long.")
		.isLength({ min: 4 })
		.run(req);
	await check("confirm", "Passwords must match.")
		.equals(req.body.password)
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("back");
	}

	async.waterfall(
		[
			function resetPassword(
				done: (err: any, user: UserDocument) => void,
			) {
				User.findOne({ passwordResetToken: req.params.token })
					.where("passwordResetExpires")
					.gt(Date.now())
					.exec((err, user: any) => {
						if (err) {
							return next(err);
						}
						if (!user) {
							req.flash("errors", {
								msg: "Password reset token is invalid or has expired.",
							});
							return res.redirect("back");
						}
						user.password = req.body.password;
						user.passwordResetToken = undefined;
						user.passwordResetExpires = undefined;
						user.save((err: WriteError) => {
							if (err) {
								return next(err);
							}
							req.logIn(user, (err) => {
								done(err, user);
							});
						});
					});
			},
			function sendResetPasswordEmail(
				user: UserDocument,
				done: (err: Error) => void,
			) {
				const mailOptions = {
					to: user.email,
					from: "SinkOrBeSunk@gmail.com",
					subject: "Your password has been changed",
					text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
				};
				sgMail.send(mailOptions, undefined, (err) => {
					req.flash("success", {
						msg: "Success! Your password has been changed.",
					});
					done(err);
				});
			},
		],
		(err) => {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		},
	);
};

/**
 * Forgot Password page.
 * @route GET /forgot
 */
export const getForgot = (req: Request, res: Response): void => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	res.render("account/forgot", {
		title: "Forgot Password",
	});
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("email", "Please enter a valid email address.")
		.isEmail()
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/forgot");
	}

	async.waterfall(
		[
			function createRandomToken(
				done: (err: Error, token: string) => void,
			) {
				crypto.randomBytes(16, (err, buf) => {
					const token = buf.toString("hex");
					done(err, token);
				});
			},
			function setRandomToken(
				token: AuthToken,
				done: (
					err: NativeError | WriteError,
					token?: AuthToken,
					user?: UserDocument,
				) => void,
			) {
				User.findOne(
					{ email: req.body.email },
					(err: NativeError, user: any) => {
						if (err) {
							return done(err);
						}
						if (!user) {
							req.flash("errors", {
								msg: "Account with that email address does not exist.",
							});
							return res.redirect("/forgot");
						}
						user.passwordResetToken = token;
						user.passwordResetExpires = Date.now() + 3600000; // 1 hour
						user.save((err: WriteError) => {
							done(err, token, user);
						});
					},
				);
			},
			function sendForgotPasswordEmail(
				token: AuthToken,
				user: UserDocument,
				done: (err: Error) => void,
			) {
				const mailOptions = {
					to: user.email,
					from: "SinkOrBeSunk@gmail.com",
					subject: "Reset your password on Sink or be Sunk",
					text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
				};
				sgMail.send(mailOptions, undefined, (err) => {
					req.flash("info", {
						msg: `An e-mail has been sent to ${user.email} with further instructions.`,
					});
					done(err);
				});
			},
		],
		(err) => {
			if (err) {
				return next(err);
			}
			res.redirect("/forgot");
		},
	);
};

/**
 * Update current password.
 * @route POST /account/friend
 */
export const postUpdateFriends = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	await check("friend", "Must Enter Valid Username")
		.matches(USERNAME_REGEX)
		.run(req);
	await check("friend", "Username has a max of 32 characters")
		.isLength({ max: 32 })
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		req.flash("errors", errors.array());
		return res.redirect("/account");
	}

	// //A is requesting B
	const userA = req.user as UserDocument;
	const userB = await User.findOne({ username: req.body.friend });

	// logger.debug("userA before: ");
	// logger.debug(userA);
	// logger.debug("userB before: ");
	// logger.debug(userB);
	if (!userB) {
		req.flash("errors", { msg: `Cannot find user ${req.body.friend}` });
		return res.redirect("/account");
	}

	const docA = await Friend.findOneAndUpdate(
		{ requester: userA.id, recipient: userB.id },
		{ $set: { status: FriendStatus.REQUESTED } },
		{ upsert: true, new: true },
	);
	const docB = await Friend.findOneAndUpdate(
		{ recipient: userA.id, requester: userB.id },
		{ $set: { status: FriendStatus.PENDING } },
		{ upsert: true, new: true },
	);
	const updateUserA = await User.findOneAndUpdate(
		{ _id: userA.id, friends: { $ne: docA._id } },
		{ $push: { friends: docA._id } },
	);
	const updateUserB = await User.findOneAndUpdate(
		{ _id: userB.id, friends: { $ne: docB._id } },
		{ $push: { friends: docB._id } },
	);

	if (!updateUserA) {
		req.flash("errors", {
			msg: `You have already requested ${req.body.friend}`,
		});
		return res.redirect("/account");
	}

	logger.debug("userA after: ");
	logger.debug(updateUserA);
	logger.debug("userB after: ");
	logger.debug(updateUserB);

	req.flash("success", {
		msg: `Success! You have friend requested ${userB.profile.name} (${userB.username})`,
	});
	return res.redirect("/account");
};

/**
 * Delete user friend.
 * @route POST /account/friend/delete
 */
export const postFriendDeleteAction = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const user = req.user as UserDocument;
	// User.deleteOne({ _id: user.id }, undefined, (err) => {
	// 	if (err) {
	// 		return next(err);
	// 	}
	// 	req.logout();
	// 	req.flash("info", { msg: "Your account has been deleted." });
	// 	res.redirect("/");
	// });
	const id = req.params.id;
	logger.debug(id);
	req.flash("info", { msg: `Friend Removed` });
	return res.redirect("/account");
};
