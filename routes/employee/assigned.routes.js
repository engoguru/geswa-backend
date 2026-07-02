import express from 'express'
import { auth } from '../../auth/authentication.js'
import { createAssignedRole, getAssignedRoleById, getTeam } from '../../controllers/employee/assigned.controller.js'
const assignedRoutes=express.Router()

assignedRoutes.post("/create",auth,createAssignedRole)


assignedRoutes.get("/view/:id",auth,getAssignedRoleById)

assignedRoutes.get("/team",auth ,getTeam)




export default assignedRoutes