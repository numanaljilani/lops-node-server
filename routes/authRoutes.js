import exporess from "express";
import { loginUser, profile } from "../controllers/auth.controller.js";
import authenticate from "../middleware/authMiddleware.js";

const router = exporess.Router();

router.post("/login", loginUser);
router.get("/profile", authenticate, profile);

export default router;
