import express from "express"
import { createMemberPlan, deleteMemberPlan, getMemberPlanById, getMemberPlans, toggleMemberPlanStatus, updateMemberPlan } from "../../controllers/memberShip/plan.controller.js";

const planRoute=express.Router()


planRoute.post("/create", createMemberPlan);

planRoute.get("/viewAll", getMemberPlans);


planRoute.get("/viewOne/:id", getMemberPlanById);


planRoute.put("/update/:id", updateMemberPlan);


planRoute.patch("/updateStaus/:id/status", toggleMemberPlanStatus);


planRoute.delete("/delete/:id", deleteMemberPlan);



export default planRoute;