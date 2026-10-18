const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || "logs";
const LOG_FILE = path.join(LOG_DIR, "_app.log");

fs.mkdirSync(LOG_DIR, { recursive: true });
const stream = fs.createWriteStream(LOG_FILE, { flags: "a" });

const SENSITIVE_KEYS = /pass(word)?|secret|token|authorization|cookie|mongo_?uri/i;

const scrubString = (text) =>
    text
        .replace(/Bearer\s+[\w.~+/-]+=*/gi, "Bearer [REDACTED]")
        .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[REDACTED_JWT]")
        .replace(/(mongodb(\+srv)?:\/\/)[^@\s/]+@/gi, "$1[REDACTED]@");

const redact = (value) => {
    if (typeof value === "string") return scrubString(value);
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === "object") {
        const clean = {};
        for (const [key, val] of Object.entries(value)) {
            clean[key] = SENSITIVE_KEYS.test(key) ? "[REDACTED]" : redact(val);
        }
        return clean;
    }
    return value;
};

const write = (level, event, details = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...redact(details)
    };

    const line = JSON.stringify(entry);
    stream.write(line + "\n");

    if (process.env.NODE_ENV !== "test") {
        (level === "error" ? console.error : console.log)(line);
    }
};

module.exports = {
    info: (event, details) => write("info", event, details),
    warn: (event, details) => write("warn", event, details),
    error: (event, details) => write("error", event, details)
};
