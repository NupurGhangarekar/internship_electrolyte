const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { taskCreateValidator, taskUpdateValidator } = require("../validators/task.validators");
const { getTasks, createTask, updateTask, deleteTask, dashboardStats } = require("../controllers/task.controller");

router.use(protect);
router.get("/stats/dashboard", dashboardStats);
router.get("/", getTasks);
router.post("/", authorize("admin"), taskCreateValidator, validate, createTask);
router.put("/:id", taskUpdateValidator, validate, updateTask);
router.delete("/:id", authorize("admin"), deleteTask);

module.exports = router;
