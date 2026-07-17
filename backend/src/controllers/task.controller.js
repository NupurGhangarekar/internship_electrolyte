const Task = require("../models/Task");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { sendTaskAssignedEmail } = require("../services/email.service");

const buildTaskFilter = (req) => {
  const { status, priority, assignedTo } = req.query;
  const filter = req.user.role === "intern" ? { assignedTo: req.user._id } : {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo && req.user.role === "admin") filter.assignedTo = assignedTo;
  return filter;
};

const getTasks = asyncHandler(async (req, res) => {
  const { sort = "-createdAt", page = 1, limit = 10 } = req.query;
  const filter = buildTaskFilter(req);
  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter).populate("assignedTo", "name email department").populate("assignedBy", "name email").sort(sort).skip(skip).limit(Number(limit)),
    Task.countDocuments(filter)
  ]);
  sendSuccess(res, tasks, "Tasks fetched", 200, { total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const createTask = asyncHandler(async (req, res) => {
  const intern = await User.findOne({ _id: req.body.assignedTo, role: "intern" });
  if (!intern) throw new AppError("Assigned user must be an intern", 400);

  const task = await Task.create({ ...req.body, assignedBy: req.user._id });
  await task.populate("assignedTo", "name email department");
  sendTaskAssignedEmail({ to: intern.email, name: intern.name, taskTitle: task.title, dueDate: task.dueDate }).catch(console.error);
  sendSuccess(res, task, "Task created", 201);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError("Task not found", 404);

  if (req.user.role === "intern") {
    if (!task.assignedTo.equals(req.user._id)) throw new AppError("Task not found", 404);
    const allowedStatus = ["Pending", "In Progress", "Submitted"];
    if (req.body.status && !allowedStatus.includes(req.body.status)) throw new AppError("Interns cannot mark tasks completed", 403);
    task.status = req.body.status || task.status;
    task.remarks = req.body.remarks ?? task.remarks;
  } else {
    Object.assign(task, req.body);
  }

  await task.save();
  await task.populate("assignedTo", "name email department");
  sendSuccess(res, task, "Task updated");
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError("Task not found", 404);
  await task.deleteOne();
  sendSuccess(res, null, "Task deleted");
});

const dashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    const [totalInterns, activeInterns, pendingTasks, completedTasks] = await Promise.all([
      User.countDocuments({ role: "intern" }),
      User.countDocuments({ role: "intern", joiningDate: { $lte: new Date() } }),
      Task.countDocuments({ status: { $ne: "Completed" } }),
      Task.countDocuments({ status: "Completed" })
    ]);
    return sendSuccess(res, { totalInterns, activeInterns, pendingTasks, completedTasks }, "Admin stats fetched");
  }

  const [assignedTasks, completedTasks, pendingTasks] = await Promise.all([
    Task.countDocuments({ assignedTo: req.user._id }),
    Task.countDocuments({ assignedTo: req.user._id, status: "Completed" }),
    Task.countDocuments({ assignedTo: req.user._id, status: { $ne: "Completed" } })
  ]);
  const progress = assignedTasks ? Math.round((completedTasks / assignedTasks) * 100) : 0;
  sendSuccess(res, { assignedTasks, completedTasks, pendingTasks, progress }, "Intern stats fetched");
});

module.exports = { getTasks, createTask, updateTask, deleteTask, dashboardStats };
