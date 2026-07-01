import { Router, Request, Response } from "express";
import type { ApiResponse, CreateUserDto, UserProfile } from "../types";

const router = Router();

// POST /api/users/register
router.post("/register", async (req: Request<object, object, CreateUserDto>, res: Response<ApiResponse<UserProfile>>) => {
  try {
    const { phone, email, name, pancard } = req.body;

    // TODO: Integrate with Prisma client
    // const hashedPassword = await bcrypt.hash(password, 12);
    // const user = await prisma.user.create({ data: { ... } });

    const mockUser: UserProfile = {
      id: "usr_" + Date.now(),
      phone,
      email,
      name,
      pancard,
      createdAt: new Date(),
    };

    res.status(201).json({ success: true, data: mockUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/users/profile/:id
router.get("/profile/:id", async (req: Request<{ id: string }>, res: Response<ApiResponse<UserProfile>>) => {
  try {
    const { id } = req.params;

    // TODO: Fetch from Prisma
    const mockUser: UserProfile = {
      id,
      phone: "+91 98765 43210",
      email: "trader@tradadda.com",
      name: "Rahul Sharma",
      pancard: "ABCDE1234F",
      createdAt: new Date("2024-01-15"),
    };

    res.json({ success: true, data: mockUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as userRoutes };
