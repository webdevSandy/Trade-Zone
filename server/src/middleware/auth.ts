import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ─── Extend Request Type ────────────────────────────────────────────────────────
// Add custom user property to Express's Request interface
// ─────────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// ─── JWT Authentication Middleware ──────────────────────────────────────────────
// Validates the Bearer token sent in Authorization headers
// ─────────────────────────────────────────────────────────────────────────────────

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication token missing. Please log in.",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    
    next();
  } catch (error: any) {
    console.error("❌ JWT Verification failed:", error.message);
    res.status(403).json({
      success: false,
      error: "Invalid or expired session. Please log in again.",
    });
  }
};
