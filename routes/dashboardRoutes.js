import exporess from "express";
import authenticate from "../middleware/authMiddleware.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = exporess.Router();

router.get("/admin", authenticate,getAdminDashboard);


export default router;
