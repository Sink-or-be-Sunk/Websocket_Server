import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as contactController from "./controllers/contact";
import * as gameController from "./controllers/game";
import * as connectController from "./controllers/connect";
import * as adminController from "./controllers/admin";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import logger from "./util/logger";
import { UserDocument, userIsAdmin } from "./models/User";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose
	.connect(mongoUrl)
	.then(() => {
		/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
	})
	.catch((err) => {
		logger.error(
			`MongoDB connection error. Please make sure MongoDB is running. ${err}`,
		);

		// process.exit();
	});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: SESSION_SECRET,
		store: new MongoStore({
			mongoUrl,
			// mongoOptions: {
			//     autoReconnect: true,
			// }
		}),
	}),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
	//ADDS VARIABLES TO GLOBAL SCOPE FOR PUG PAGES
	const user = req.user as UserDocument;
	res.locals.user = user; //provide user profile into to page
	res.locals.admin = userIsAdmin(user?.email); //provide admin profile into to page
	next();
});
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (
		!req.user &&
		req.path !== "/login" &&
		req.path !== "/signup" &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.path;
	} else if (req.user && req.path == "/account") {
		req.session.returnTo = req.path;
	}
	next();
});

app.use(
	express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }),
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post(
	"/account/profile",
	passportConfig.isAuthenticated,
	userController.postUpdateProfile,
);
app.post(
	"/account/password",
	passportConfig.isAuthenticated,
	userController.postUpdatePassword,
);
app.post(
	"/account/delete",
	passportConfig.isAuthenticated,
	userController.postDeleteAccount,
);
app.post(
	"/account/friend",
	passportConfig.isAuthenticated,
	userController.postAddFriend,
);
app.post(
	"/account/friend/delete/:id",
	passportConfig.isAuthenticated,
	userController.postFriendDeleteAction,
);
app.post(
	"/account/friend/accept/:id",
	passportConfig.isAuthenticated,
	userController.postFriendAcceptAction,
);
app.get(
	"/game/game3d",
	passportConfig.isAuthenticated,
	gameController.getGame3D,
);
app.get(
	"/game/game2d",
	passportConfig.isAuthenticated,
	gameController.getGame2D,
);
app.get(
	"/connect",
	passportConfig.isAuthenticated,
	connectController.getConnect,
);
app.get(
	"/admin/console",
	passportConfig.isAuthenticated,
	passportConfig.isAdmin,
	adminController.getAdminConsole,
);
app.get(
	"/admin/log",
	passportConfig.isAuthenticated,
	passportConfig.isAdmin,
	adminController.getLog,
);
app.post(
	"/admin/action",
	passportConfig.isAuthenticated,
	passportConfig.isAdmin,
	adminController.postAction,
);
export default app;
