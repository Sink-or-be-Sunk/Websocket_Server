import { Strategy as LocalStrategy } from "passport-local";
import { compare } from "bcryptjs";
import passport, { PassportStatic } from "passport";

export default function initialize(
	passport: PassportStatic,
	getUserByEmail: (email: string) => any,
	getUserById: (id: string) => any,
) {
	const authenticateUser = async (email, password, done) => {
		const user = getUserByEmail(email);
		if (user == null) {
			return done(null, false, { message: "No user with that email" });
		}

		try {
			if (await compare(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, { message: "Password incorrect" });
			}
		} catch (e) {
			return done(e);
		}
	};

	passport.use(
		new LocalStrategy({ usernameField: "email" }, authenticateUser),
	);
	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser((id, done) => {
		return done(null, getUserById(id));
	});
}
