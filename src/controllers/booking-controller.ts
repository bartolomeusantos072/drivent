import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from  "@/services/booking-service";

export async function postBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  if( Object.keys(req.body).indexOf("roomId") !== 0) {
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }

  const { roomId } = req.body;
  if(!Number(roomId) || Number(roomId) <= 0 || !roomId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  try {
    const bookingId = await bookingService.postBookingId(userId, roomId);
    return res.status(httpStatus.OK).send(bookingId.toString());   
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);    
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

export async function getBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  if(!userId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  
  try {
    const viewBooking = await bookingService.getBookingId(userId);
    return res.status(httpStatus.OK).send(viewBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);    
  }
}
