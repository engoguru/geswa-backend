import express from "express"
import { auth } from "../../auth/authentication.js";
import { createVillage, getVillagesByTaluka } from "../../controllers/coordinator/village.controller.js";
const villageRoutes=express.Router();


villageRoutes.post("/create",auth   , createVillage)

villageRoutes.get("/viewAll/:talukaId" , auth , getVillagesByTaluka)


export default villageRoutes;

