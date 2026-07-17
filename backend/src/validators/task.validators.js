const { body } = require("express-validator");

const taskCreateValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("assignedTo").isMongoId().withMessage("Valid intern is required"),
  body("priority").optional().isIn(["Low", "Medium", "High", "Urgent"]).withMessage("Invalid priority"),
  body("dueDate").isISO8601().withMessage("Valid due date is required")
];

const taskUpdateValidator = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("assignedTo").optional().isMongoId().withMessage("Invalid intern"),
  body("priority").optional().isIn(["Low", "Medium", "High", "Urgent"]).withMessage("Invalid priority"),
  body("dueDate").optional().isISO8601().withMessage("Invalid due date"),
  body("status").optional().isIn(["Pending", "In Progress", "Submitted", "Completed"]).withMessage("Invalid status")
];

module.exports = { taskCreateValidator, taskUpdateValidator };
