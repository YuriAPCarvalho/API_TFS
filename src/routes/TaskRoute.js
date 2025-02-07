import express from 'express'
import TaskController from '../controllers/TaskController.js';
import { verifyJWT } from '../Middleware/verifyJWT.js';

const TaskRoute  = express.Router();

TaskRoute.post("/task", verifyJWT , TaskController.post);
TaskRoute.post("/task/createTask", verifyJWT , TaskController.createTask);

export default TaskRoute;