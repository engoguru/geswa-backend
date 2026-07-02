import express from "express"
import { auth } from "../../auth/authentication.js"
import { createDepartment, getAllDepartments } from "../../controllers/coordinator/department.controller.js"
const departmentRoute=express.Router()

departmentRoute.post("/create",auth,createDepartment)
departmentRoute.get("/viewAll",auth,getAllDepartments)





export default departmentRoute
