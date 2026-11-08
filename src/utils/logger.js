import crypto from "node:crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            singleLine: false,
            ignore: "pid,hostname"
          }
        }
      : undefined,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "password",
      "accessToken",
      "encrypted_data"
    ],
    censor: "[REDACTED]"
  }
});

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const requestId =
      req.headers["x-request-id"] || crypto.randomUUID();

    res.setHeader("x-request-id", requestId);

    return requestId;
  },

  customErrorMessage: (req, res, error) => {
    return `Request failed: ${req.method} ${req.url}: ${error.message}`;
  },

  customLogLevel: (req, res, error) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  }
});