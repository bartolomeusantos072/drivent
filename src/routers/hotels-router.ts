import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getPaidTicketWithAccommodation, getHotelsId } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getPaidTicketWithAccommodation)
  .get("/:hotelId", getHotelsId)
;
export { hotelsRouter };
