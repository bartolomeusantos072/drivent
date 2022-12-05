import { notFoundError } from "@/errors";
import { Forbidden } from "@/errors/forbidden";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

export async function getBookingId(userId: number) {
  const countBooking = await bookingRepository.countBooking(userId);
  if(countBooking!== 1 ) throw notFoundError();

  const booking = await bookingRepository.searchBookingByUserId(userId);
  if (!booking)  throw notFoundError();
  
  const room = await hotelsRepository.searchHotelByRoomId(booking.roomId);
  if (!room || (room.capacity - countBooking <= 0)) throw notFoundError();
  
  const hotel = await hotelsRepository.viewHotel(room.hotelId);
  if (!hotel)  throw notFoundError();

  const acommodation = acommodadion(room.name, room.capacity);
  const myRoom = { image: hotel.image, hotel: hotel.name, ...acommodation, sharedRoom: (countBooking-1) };
  return { id: booking.id, Room: myRoom  };
}

export async function postBookingId(userId: number, roomId: number) {
  const hotel = await hotelsRepository.viewHotel(roomId);
  if (!hotel) throw notFoundError();

  const room = await hotelsRepository.searchHotelByRoomId(roomId);
  if (!room) throw notFoundError();
  
  const checkBookingByUserId = await bookingRepository.countBookingByUserId(userId);
  if(checkBookingByUserId != 0) throw Forbidden();

  const availabilityBooking = await bookingRepository.countBooking(roomId);
  if ((room.capacity - availabilityBooking) <= 0) throw Forbidden();

  const booking = await bookingRepository.postBookingId(userId, roomId);
  return booking.id;
}

export async function putBookingId(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw Forbidden();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") throw Forbidden();

  const ticketsType = await ticketRepository.ticketsTypeIsPresentialCheck(ticket.ticketTypeId);
  if (!ticketsType) throw Forbidden();

  if (!ticketsType.includesHotel && ticket.status !== "PAID") throw Forbidden();

  const searchBooking = await bookingRepository.searchBookingId(bookingId);
  if (!searchBooking) throw notFoundError();

  const room = await bookingRepository.searchBookingByRoomId(roomId);
  if (!room) throw notFoundError();

  const availabilityBooking = await bookingRepository.countBooking(roomId);
  if ((room.capacity - availabilityBooking) <= 0) throw Forbidden();

  const updateBooking = await bookingRepository.putBookingId(userId, roomId, bookingId);
  return updateBooking.id;
}

function acommodadion(room: string, capacity: number) {
  let typeRoom = "";

  if (capacity === 1) {
    typeRoom = "(Single)";
  }
  if (capacity === 2) {
    typeRoom = "(Double)";
  }
  if (capacity === 1) {
    typeRoom = "(Triple)";
  }
  return { room, typeRoom };
}
const bookingService = {
  getBookingId,
  postBookingId,
  putBookingId
};

export default bookingService;
