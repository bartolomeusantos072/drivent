import { notFoundError } from "@/errors";
import { Forbidden } from "@/errors/forbidden";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

export async function getBookingId(userId: number) {
  const bookingWithRoom = await bookingRepository.getBookingId(userId);
  if(!bookingWithRoom) {
    throw notFoundError(); 
  }
  return bookingWithRoom;
}

export async function postBookingId(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    // throw notFoundError();
    throw Forbidden();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") {
    // throw notFoundError();
    throw Forbidden();
  }
  const ticketsType = await ticketRepository.findTicketTypesPresential();
  if (!ticketsType) {
    // throw notFoundError();
    throw Forbidden();
  }
  if (!ticketsType.length ) throw Forbidden();
  if(!ticketsType[0].includesHotel && ticket.status!=="PAID") throw Forbidden();
  const searchBooking  = await bookingRepository.searchBookingByRoomId(roomId);
  if(!searchBooking) throw notFoundError();
 
  const countBooking = await bookingRepository.countBooking(roomId);

  if(searchBooking.capacity - countBooking.length  <= 0) throw Forbidden();

  const hotel = await hotelsRepository.viewHotel(searchBooking.hotelId);
  if(!hotel) throw Forbidden();

  const room = await hotelsRepository.viewRoom(roomId);
  if(!room) throw Forbidden();

  await bookingRepository.postBookingId(userId, roomId);
  
  const acommodation = acommodadion(room.name, room.capacity, );
  return { hotelName: hotel.name, acommodation, sharedRoom: countBooking.length };
}

export async function putBookingId(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    // throw notFoundError();
    throw Forbidden();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") {
    // throw notFoundError();
    throw Forbidden();
  }
  const ticketsType = await ticketRepository.findTicketTypesPresential();
  if (!ticketsType) {
    // throw notFoundError();
    throw Forbidden();
  }
  if (!ticketsType.length ) throw Forbidden();

  if(!ticketsType[0].includesHotel && ticket.status!=="PAID") throw Forbidden();
  
  const searchBooking  = await bookingRepository.searchBookingId(bookingId);
  if(!searchBooking) throw notFoundError();

  const availabilityRoom = await bookingRepository.searchBookingByRoomId(roomId);
  if(!availabilityRoom) throw notFoundError();

  const countBooking = await bookingRepository.countBooking(roomId);
  if(availabilityRoom.capacity - countBooking.length  <= 0) throw Forbidden();

  const updateBooking = await bookingRepository.putBookingId(userId, roomId, bookingId);
  return updateBooking;
}

function acommodadion(room: string, capacity: number) {
  let accommodation = "";

  if(capacity === 1 ) {
    accommodation = "(Single)";
  }
  if(capacity === 2 ) {
    accommodation = "(Double)";
  }
  if(capacity === 1 ) {
    accommodation = "(Triple)";
  }
  return { room, accommodation };
}
const bookingService = {
  getBookingId,
  postBookingId,
  putBookingId
};

export default bookingService;
