import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";

export type UserDocument = mongoose.Document & {
	email: string;
	password: string;
	passwordResetToken: string;
	passwordResetExpires: Date;

	tokens: AuthToken[];

	profile: {
		name: string;
	};

	comparePassword: comparePasswordFunction;
	gravatar: (size: number) => string;
};

type comparePasswordFunction = (
	candidatePassword: string,
	cb: (err: any, isMatch: any) => void,
) => void;

export interface AuthToken {
	accessToken: string;
	kind: string;
}

const userSchema = new mongoose.Schema<UserDocument>(
	{
		email: { type: String, unique: true },
		password: String,
		passwordResetToken: String,
		passwordResetExpires: Date,

		tokens: Array,

		profile: {
			name: String,
		},
	},
	{ timestamps: true },
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
	const user = this as UserDocument;
	if (!user.isModified("password")) {
		return next();
	}
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			return next(err);
		}

		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size: number = 200) {
	if (!this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`;
	}
	const md5 = crypto.createHash("md5").update(this.email).digest("hex");
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

export const User = mongoose.model<UserDocument>("User", userSchema);
