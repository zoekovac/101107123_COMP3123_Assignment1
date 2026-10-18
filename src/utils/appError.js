class appError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "appError";
        this.statusCode = statusCode;
    }
}

module.exports = appError;
