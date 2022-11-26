import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import hotelsService from  "@/services/hotels-service";

export async function getPaidTicketWithAccommodation(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const viewHotels = await hotelsService.provideHotelsView(userId);
    return res.status(httpStatus.OK).send(viewHotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }
}

export function getHotelsId(req: AuthenticatedRequest, res: Response) {
  console.log(req.userId);
}

