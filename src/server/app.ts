import express from "express";
// import compression from "compression";  // compresses requests
import session from "express-session";
// import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./utils/secrets";
import logger from "./utils/logger";

import methodOverride from "method-override";
// import ServerManager from "./objects/ServerManager";
import expressLayouts from "express-ejs-layouts";

//Routes
import indexRouter from "./routes/index";
import gameRouter from "./routes/game";
import accountRouter from "./routes/account";

// API keys and Passport configuration
import * as passportConfig from "./auth/passport-config";

// Create Express server
const app = express();

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI);
// const db = mongoose.connection;
// db.on("error", (error) => console.log(error));
// db.once("open", () => console.log("Connected to Mongoose"));

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

logger.info(`Connecting to Mongo DB at: ${mongoUrl}`);

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
app.set("views", path.join(__dirname, "../src/server/views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");
// app.use(compression());
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: SESSION_SECRET,
		store: new MongoStore({
			mongoUrl,
		}),
	}),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//     res.locals.user = req.user;
//     next();
// });
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (
		!req.user &&
		req.path !== "/account/register" &&
		req.path !== "/account/login" &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.path;
	} else if (req.user && req.path == "/account") {
		req.session.returnTo = req.path;
	}
	next();
});
app.use(express.static(path.join(__dirname, "../dist/public")));
app.use(methodOverride("_method"));

// Configure passport middleware

// Configure routes
app.use("/", indexRouter);
app.use("/game", gameRouter);
app.use("/account", passportConfig.isAuthenticated, accountRouter);
app.use("*", (req, res) => {
	res.redirect("/"); //catch all non-managed uri and redirect to homepage
});

export default app;
