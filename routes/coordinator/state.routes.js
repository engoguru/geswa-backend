
import express from "express"
import { auth } from "../../auth/authentication.js";
import { createState, getAllStates } from "../../controllers/coordinator/state.controller.js";
const stateRoutes=express.Router();

stateRoutes.post("/create", auth, createState)

stateRoutes.get("/viewAll", auth , getAllStates)



export default stateRoutes;

