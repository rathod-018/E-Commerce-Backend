class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", stack = "") {
        super(message)
        this.message = message
        this.satatusCode = statusCode

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }