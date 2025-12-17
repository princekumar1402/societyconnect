import jwt from 'jsonwebtoken';

const SECRET_KEY = 'cityconnect_secret_key';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    req.userRole = decoded.role; // Save role from token
    next();
  });
};

// NEW: Middleware for Admin only
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.userRole === 'admin') {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};