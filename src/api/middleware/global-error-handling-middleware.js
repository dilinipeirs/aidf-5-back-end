import NotFoundError from "../../domain/errors/not-found-error.js";
import ValidationError from "../../domain/errors/validation-error.js";
import UnauthorizedError from "../../domain/errors/unauthorized-error.js";

const globalErrorHandlingMiddleware = (error, req, res, next) => {
  console.log(error);
  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof UnauthorizedError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default globalErrorHandlingMiddleware;
