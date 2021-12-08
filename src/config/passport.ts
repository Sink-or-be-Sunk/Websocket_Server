import passport from "passport";
import passportLocal from "passport-local";

// import { User, UserType } from '../models/User';
import { User, UserDocument, userIsAdmin } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { NativeError } from "mongoose";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((req, user, done) => {
	done(undefined, user);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id)
			.populate({
				path: "friends",
				populate: {
					path: "recipient requester",
					select: "username profile.name",
				},
			})
			.exec();
		done(undefined, user);
	} catch (err) {
		done(err);
	}
});

/**
 * Sign in using Email and Password.
 */
passport.use(
	new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
		User.findOne(
			{ email: email.toLowerCase() },
			(err: NativeError, user: UserDocument) => {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(undefined, false, {
						message: `Email ${email} not found.`,
					});
				}
				user.comparePassword(
					password,
					(err: Error, isMatch: boolean) => {
						if (err) {
							return done(err);
						}
						if (isMatch) {
							return done(undefined, user);
						}
						return done(undefined, false, {
							message: "Invalid email or password.",
						});
					},
				);
			},
		);
	}),
);

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
};

/**
 * Administrator Check Middleware
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	const user = req.user as UserDocument;

	if (userIsAdmin(user.email)) {
		return next();
	}
	req.flash("errors", {
		msg: `Access Denied!  Account ${user.email} is not an Admin!`,
	});
	res.redirect("/");
};
