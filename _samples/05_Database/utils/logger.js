import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

export const logtail = new Logtail("uWZQrqcDuuSYtSNQGyfNcZLS", {
    endpoint: "https://s1573079.eu-nbg-2.betterstackdata.com",
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  defaultMeta: { service: "post-service" },

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    new LogtailTransport(logtail),
    // ...(process.env.NODE_ENV !== "production"
    //   ? [new winston.transports.Console()]
    //   : []),
  ],
});

export default logger;
