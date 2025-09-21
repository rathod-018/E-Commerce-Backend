class ApiErrorHandler extends Error {
    constructor(statusCode, message = "Something went wrong", stack = "") {
        super(message)
        this.satatusCode = statusCode
        this.message = message

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiErrorHandler }