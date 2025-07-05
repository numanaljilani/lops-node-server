import exporess from "express";
import authenticate from "../middleware/authMiddleware.js";
import { getAdminDashboard, getUserDashboard } from "../controllers/dashboard.controller.js";

const router = exporess.Router();

router.get("/admin", authenticate,getAdminDashboard);
router.get("/user", authenticate,getUserDashboard);


export default router;
