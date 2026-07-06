import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// ─── Helper: Generate JWT ───────────────────────────────────────────────────────
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
};

// ─── POST /api/auth/register ────────────────────────────────────────────────────
// Creates a new user with name, email, phone, and password.
// Initializes their trading wallet with ₹1,00,000 demo cash.
// ─────────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ── Input Validations ───────────────────────────────────────────────────
    if (!name || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        error: "All fields (name, email, phone, password) are required.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
      return;
    }

    // ── Create Hashed Password & Save User ──────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User, Profile, and Wallet in a single transaction
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        wallet: {
          create: {
            balance: 100000.00, // ₹1,00,000 demo balance
          },
        },
        profile: {
          create: {
            theme: "light",
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    // ── Generate Session Token ──────────────────────────────────────────────
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to TradAdda.",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        pancard: newUser.pancard,
        walletBalance: newUser.wallet?.balance || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error during registration.",
    });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────────
// Authenticates user and issues a JWT token.
// ─────────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
      return;
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        pancard: user.pancard,
        walletBalance: user.wallet?.balance || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error during login.",
    });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────────
// Retrieves details of the currently logged-in user.
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User profile not found.",
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        pancard: user.pancard,
        walletBalance: user.wallet?.balance || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Get profile error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile.",
    });
  }
});

// ─── POST /api/auth/update-pan ──────────────────────────────────────────────────
// Allows the authenticated user to set or update their optional PAN Card.
// ─────────────────────────────────────────────────────────────────────────────────
router.post("/update-pan", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pancard } = req.body;

    if (!pancard || typeof pancard !== "string") {
      res.status(400).json({
        success: false,
        error: "A valid PAN Card string is required.",
      });
      return;
    }

    const cleanedPan = pancard.toUpperCase().trim();

    // Regex check for PAN card format (optional check but good practice)
    // 5 letters, 4 digits, 1 letter
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (!panRegex.test(cleanedPan)) {
      res.status(400).json({
        success: false,
        error: "Invalid PAN Card format. E.g. ABCDE1234F",
      });
      return;
    }

    // Check if PAN card is already taken by another user
    const existingPan = await prisma.user.findFirst({
      where: {
        pancard: cleanedPan,
        NOT: { id: userId },
      },
    });

    if (existingPan) {
      res.status(409).json({
        success: false,
        error: "This PAN Card is already registered to another account.",
      });
      return;
    }

    // Update PAN Card
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { pancard: cleanedPan },
    });

    res.json({
      success: true,
      message: "PAN Card updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        pancard: updatedUser.pancard,
      },
    });
  } catch (error: any) {
    console.error("❌ Update PAN error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to update PAN Card.",
    });
  }
});

export { router as authRoutes };
