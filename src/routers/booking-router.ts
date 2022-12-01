import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getBookingId, putBookingId, postBookingId } from "@/controllers";
import { roomIdSchema } from "@/schemas/booking-schemas";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBookingId)
  .post("/", validateBody(roomIdSchema), postBookingId)
  .put("/:bookingId", validateBody(roomIdSchema), putBookingId)
;
export { bookingRouter };
