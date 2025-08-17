import UnauthorizedError from "../../domain/errors/unauthorized-error.js";

const isAuthenticated = (req, res, next) => {
  // console.log(req.auth()); // If the authorization header is not present or clerk BE tells it is invalid, this will return null
  console.log("IS_AUTHENTICATED", req.auth().isAuthenticated);
  if (!req.auth().isAuthenticated) {
    throw new UnauthorizedError("Unauthorized");
  }
  next();
};

export default isAuthenticated;
