const User = require("../models/User");
const Task = require("../models/Task");
const Document = require("../models/Document");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { removeLocalFile } = require("../services/storage.service");

const getUsers = asyncHandler(async (req, res) => {
  const { search = "", role, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { department: { $regex: search, $options: "i" } }
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter)
  ]);
  sendSuccess(res, users, "Users fetched", 200, { total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new AppError("User not found", 404);
  sendSuccess(res, user, "User fetched");
});

const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  sendSuccess(res, user, "User created", 201);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new AppError("User not found", 404);
  Object.assign(user, req.body);
  await user.save();
  user.password = undefined;
  sendSuccess(res, user, "User updated");
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") throw new AppError("Admin users cannot be deleted from this endpoint", 400);

  const docs = await Document.find({ intern: user._id });
  await Promise.all(docs.map((doc) => removeLocalFile(doc.path)));
  await Promise.all([
    Document.deleteMany({ intern: user._id }),
    Task.deleteMany({ assignedTo: user._id }),
    user.deleteOne()
  ]);
  sendSuccess(res, null, "Intern deleted");
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "joiningDate", "profileImage"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  sendSuccess(res, req.user, "Profile updated");
});

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, updateMyProfile };
