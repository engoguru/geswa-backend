import express from "express"
import { cancelMembership, createPurchase, getPurchaseByEmployeeId, getPurchaseById, getPurchaseByMemberId, getPurchases, getUserPurchases, updateMembershipStatus, updatePaymentStatus } from "../../controllers/memberShip/purchase.controller.js";
import { auth } from "../../auth/authentication.js";
const purchaseRoute=express.Router()



purchaseRoute.post("/create", auth, createPurchase);

purchaseRoute.get("/viewAll",auth, getPurchases);

purchaseRoute.get("/:id", getPurchaseById);


purchaseRoute.get("/member/:memberId", getPurchaseByMemberId);


purchaseRoute.get("/user/:userId", getUserPurchases);

purchaseRoute.get("/emplyeeAssign/:employeeId",auth, getPurchaseByEmployeeId);


purchaseRoute.patch("/:id/payment", updatePaymentStatus);

purchaseRoute.patch("/:id/status", updateMembershipStatus);

purchaseRoute.patch("/:id/cancel", cancelMembership);


export default purchaseRoute