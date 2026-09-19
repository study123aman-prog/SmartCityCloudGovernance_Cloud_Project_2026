import jwt from "jsonwebtoken";

export function requireAuth(jwtSecret) {
  return (request, response, next) => {
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      return response.status(401).json({ error: "Authentication required" });
    }

    try {
      request.auth = jwt.verify(token, jwtSecret);
      return next();
    } catch {
      return response.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
