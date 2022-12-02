import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from  "@/services/booking-service";

export async function getBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const viewBooking = await bookingService.getBookingId(userId);
    return res.status(httpStatus.OK).send(viewBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }
}

export async function postBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const idRoom = Number(req.body.roomId);
  try {
    const bookingId = await bookingService.postBookingId(userId, idRoom);
    return res.status(httpStatus.OK).send(bookingId.toString());   
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);    
  }
}

export async function putBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const idRoom = Number(req.body.roomId);
  const idBookingId = Number(req.params.bookingId);
  try {
    const changeBooking = await bookingService.putBookingId(userId, idRoom, idBookingId);
    return res.status(httpStatus.OK).send(changeBooking.toLocaleString());   
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);    
  }
}

