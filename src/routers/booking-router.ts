import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getBookingId, putBookingId, postBookingId } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBookingId)
  .post("/",  postBookingId)
  .put("/:bookingId", putBookingId)
;
export { bookingRouter };
