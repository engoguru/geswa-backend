import express from "express"
import { auth } from "../../auth/authentication.js";
import { createTaluka, getTalukasByDistrict } from "../../controllers/coordinator/taluka.controller.js";
const talukaRoutes=express.Router();

talukaRoutes.post("/create", auth , createTaluka)

talukaRoutes.get("/viewAll/:districtId", auth, getTalukasByDistrict)




export default talukaRoutes;
