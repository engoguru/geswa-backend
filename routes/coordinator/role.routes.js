import express from "express"
import { auth } from "../../auth/authentication.js";
import { createRole, getAllRoles, getRoleByDepartment } from "../../controllers/coordinator/role.controller.js";
const roleRoutes=express.Router();

roleRoutes.post("/create", auth,createRole)

roleRoutes.get("/viewAll/:id", auth, getRoleByDepartment)



export default roleRoutes;

