const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided or malformed token.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  // Verify JWT_SECRET is set
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured in .env file for authMiddleware.');
    return res.status(500).json({ error: 'Server configuration error (auth).' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user from payload to request object
    // This makes the user information available in subsequent route handlers
    req.user = decoded; // The decoded payload typically contains { userId, email, iat, exp }

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized. Token verification failed.' });
  }
};

module.exports = authMiddleware;
