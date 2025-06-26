import exporess from "express";
import { changePassword, loginUser, profile } from "../controllers/auth.controller.js";
import authenticate from "../middleware/authMiddleware.js";

const router = exporess.Router();

router.post("/login", loginUser);
router.get("/profile", authenticate, profile);
router.put("/password", authenticate, changePassword);

export default router;
