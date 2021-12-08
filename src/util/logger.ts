import winston from "winston";

const options: winston.LoggerOptions = {
	transports: [
		new winston.transports.Console({
			level: process.env.NODE_ENV === "production" ? "error" : "debug",
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp({
					format: "YYYY-MM-DD HH:mm:ss",
				}),
				winston.format.printf(
					(info) =>
						`${info.timestamp} ${info.level}: ${info.message}`,
				),
			),
		}),
		new winston.transports.File({
			filename: "debug.log",
			options: { flags: "w" },
			level: "debug",
			format: winston.format.combine(
				winston.format.timestamp({
					format: "YYYY-MM-DD HH:mm:ss",
				}),
				winston.format.printf(
					(info) =>
						`${info.timestamp} ${info.level}: ${info.message}`,
				),
			),
		}),
	],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "production") {
	logger.debug("Logging initialized at debug level");
}
if (process.env.NODE_ENV == "test") {
	logger.warn("Silencing Logs For Tests");
	logger.transports.forEach((transport) => {
		transport.silent = true;
	});
}

export default logger;
