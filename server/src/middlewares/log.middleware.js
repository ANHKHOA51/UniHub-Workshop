// middleware/logger.js

import { formatTime } from "../utils/time.helper.js";
const colors = {
    reset: "\x1b[0m",

    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    white: "\x1b[37m",
};

const methodColor = {
    GET: colors.green,
    POST: colors.blue,
    PUT: colors.yellow,
    DELETE: colors.red,
    PATCH: colors.magenta,
};

function colorize(color, text) {
    return `${color}${text}${colors.reset}`;
}

export const loggerMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        const method = colorize(
            methodColor[req.method] || colors.white,
            req.method.padEnd(6)
        );

        let statusColor = colors.green;

        if (res.statusCode >= 500) {
            statusColor = colors.red;
        } else if (res.statusCode >= 400) {
            statusColor = colors.yellow;
        } else if (res.statusCode >= 300) {
            statusColor = colors.cyan;
        }

        const status = colorize(
            statusColor,
            res.statusCode
        );

        const time = colorize(
            colors.magenta,
            `${duration}ms`
        );

        const url = colorize(
            colors.white,
            req.originalUrl
        );

        const date = colorize(
            colors.gray,
            formatTime()
        );

        console.log(
            `${date} ${method} ${url} ${status} ${time}`
        );
    });

    next();
};
