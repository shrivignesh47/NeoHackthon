const jwt = require("jsonwebtoken");

// JWT verification middleware
const verifyToken = (req, res, next) => {
  // Get token from request headers
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  // Remove "Bearer " from the token if sent in that format
  const cleanToken = token.split(" ")[1];

  try {
    // Verify the token
    const verified = jwt.verify(cleanToken, "jwtSecret");
    req.user = verified; // Attach user info to request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = verifyToken;
