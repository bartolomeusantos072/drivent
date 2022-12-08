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
  const { roomId } = req.body;

  if( !roomId|| ((Number(roomId) <= 0))) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  try {
    const bookingId = await bookingService.postBookingId(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: bookingId.toString() });   
  } catch (error) {
    if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }
}

export async function putBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  if( !roomId|| ((Number(roomId) <= 0))) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  const idBookingId = Number(req.params.bookingId);
  if( !idBookingId|| ((Number(idBookingId) <= 0))) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const changeBooking = await bookingService.putBookingId(userId, roomId, idBookingId);
    return res.status(httpStatus.OK).send(changeBooking.toLocaleString());   
  } catch (error) {
    if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }
}

