import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwtService.js";
import Employee from "../models/EmployeeModel.js";

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login api");
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const employee = await Employee.findOne({ userId: user._id }).populate(
      "company"
    );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const payload = { userId: user._id, email: user.email, role: user.access };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({ accessToken, refreshToken, user, employee });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const profile = async (req, res) => {
  try {
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const employee = await Employee.findOne({ userId: user._id }).populate(
      "company"
    );

    res.status(200).json({ user, employee });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { loginUser,profile };
