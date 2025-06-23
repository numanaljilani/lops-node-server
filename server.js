import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDB from './config/db.js';
import userRoutes from './routes/authRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import clientRoutes from './routes/clientsRoutes.js'
import rfqRoutes from './routes/rfqRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import timesheetRoutes from './routes/timesheetRoutes.js'



// Load env variables
dotenv.config();


const app = express()
connectDB();



// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});


app.use("/api/v1",userRoutes)
app.use("/api/v1/employee",employeeRoutes)
app.use("/api/v1/company",companyRoutes)
app.use("/api/v1/client",clientRoutes)
app.use("/api/v1/rfq",rfqRoutes)
app.use("/api/v1/project",projectRoutes)
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/task",taskRoutes)
app.use("/api/v1/timesheet",timesheetRoutes)

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));