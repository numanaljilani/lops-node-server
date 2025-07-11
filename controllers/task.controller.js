import mongoose from "mongoose";
import ProjectPayment from "../models/paymentballModel.js";
import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import User from "../models/User.js";
import Employee from '../models/EmployeeModel.js'


// CREATE Task
export const createTask = async (req, res) => {
  try {
    const projectPaymentId = await ProjectPayment.findById(req?.body?.paymentId)
    if(projectPaymentId.projectId && projectPaymentId.companyId){
      req.body.companyId = projectPaymentId.companyId
      req.body.projectId = projectPaymentId.projectId
    }


    const result = await Task.aggregate([
      {
        $match: {
          paymentId: projectPaymentId._id,
        },
      },
      {
        $group: {
          _id: null,
          totalWeightage: { $sum: "$weightage" },
        },
      },
    ]);
    console.log(result)

    const totalWeightage = result[0]?.totalWeightage || 0;
    if( totalWeightage + Number(req.body.weightage) > 100 ){
      return res.status(400).json({ message: `you can not create more task. max limit is 100, this ball have remaing percentage is ${100 - totalWeightage}` });
    }
    // console.log(totalWeightage , ">>>")
    const task = await Task.create(req.body);
    // console.log(req.body)
    res.status(201).json({ message: "Task created", task });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET All Tasks (with optional filter by paymentId)
export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.paymentId) {
      filter.paymentId = req.query.paymentId;
    }
    if(req.query.companyId){
      filter.companyId = req.query.companyId
    }
    let tasks;
    if (req.query.mytask) {
      const myEmployeeId = await Employee.findOne({userId : req?.user?.userId})
     
      const payments = await ProjectPayment.find({
        projectId: req.query.projectId,
      }).select("_id");
      const paymentIds = payments.map((p) => p._id);
      tasks = await Task.find({
        assigne: myEmployeeId._id,
        paymentId: { $in: paymentIds },
      })
        .populate("paymentId assigne")
        .sort({ due_date: 1 });
      console.log(tasks, "MY TASK");
    } else {
      tasks = await Task.find(filter)
        .populate("paymentId assigne")
        .sort({ due_date: 1 });
    }
    // console.log(req.query.projectId)
    // console.log(req.query.mytask)

    res.status(200).json({ data: tasks });
  } catch (err) {
    console.error("Get All Tasks Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET Task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "paymentId assignedTo"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE Task
export const updateTask = async (req, res) => {
  console.log(req.body.projectId, "req.body.projectId");
  console.log(req.body.paymentId, "req.body.paymentId");
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Task not found" });
    const tasks = await Task.find({ paymentId: req.body.paymentId });

    let paymentCompletion = 0;

    tasks.forEach((task) => {
      const weightage = Number(task.weightage || 0); // % like 20, 30, etc.
      const completion = Number(task.completion_percentage || 0); // 0 to 100
      paymentCompletion += (completion * weightage) / 100;
    });

    await ProjectPayment.findByIdAndUpdate(req.body.paymentId, {
      completionPercentage: paymentCompletion,
    });

    const payments = await ProjectPayment.find({
      projectId: req.body.projectId,
    });
    console.log(payments, "PAYMENTS");

    let projectCompletion = 0;

    payments.forEach((payment) => {
      const paymentPercent = Number(payment.projectPercentage || 0); // like 40%
      const paymentCompletion = Number(payment.completionPercentage || 0); // like 65%
      projectCompletion += (paymentCompletion * paymentPercent) / 100;
    });

    console.log({ projectCompletion, paymentCompletion });
    const project = await Project.findByIdAndUpdate(req.body.projectId, {
      completion_percentage: projectCompletion,
    });
    console.log(project);
    res.status(200).json({ message: "Task updated", task: updated });
  } catch (err) {
    console.error("Update Task Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// export const updateTask = async (req, res) => {
//   try {
//     const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });

//     const result = await Task.aggregate([
//       {
//         $match: {
//           paymentId: new mongoose.Types.ObjectId(req.body.paymentId), // now correctly matched as ObjectId
//           completion_percentage: { $exists: true, $ne: null },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalCompletionPercentage: { $sum: "$completion_percentage" },
//         },
//       },
//     ]);

//     const totalTaskPercentage =
//       result.length > 0 ? result[0].totalCompletionPercentage : 0;
//     console.log("Total Completion %:", totalTaskPercentage);
//     const updatePayment = await ProjectPayment.findByIdAndUpdate(
//       req.body.paymentId, // or req.params.id or your actual ID
//       { completionPercentage: totalTaskPercentage }, // fields to update
//       { new: true } // returns the updated document
//     );
//     const updateProjectPercentage = await Project.findByIdAndUpdate(req.body.projectId,{
//       completion_percentage : 0
//     })

//     if (!updated) return res.status(404).json({ message: "Task not found" });
//     res.status(200).json({ message: "Task updated", task: updated });
//   } catch (err) {
//     console.error("Update Task Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// DELETE Task
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
