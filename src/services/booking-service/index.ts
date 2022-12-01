import { notFoundError } from "@/errors";
import { Forbidden } from "@/errors/forbidden";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

export async function getBookingId(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") throw notFoundError();
  
  const ticketsType = await ticketRepository.ticketsTypeIsPresentialCheck(ticket.ticketTypeId);
  if (!ticketsType) throw notFoundError();
  
  if (!ticketsType.includesHotel && ticket.status !== "PAID") throw notFoundError();
  
  const booking = await bookingRepository.searchBookingByUserId(userId);
  if (!booking)  throw notFoundError();
  
  const room = await hotelsRepository.searchHotelByRoomId(booking.roomId);
  if (!room)  throw notFoundError();
  
  const hotel = await hotelsRepository.viewHotel(room.hotelId);
  if (!hotel)  throw notFoundError();
  
  const countBooking = await bookingRepository.countBooking(room.id);
  if(!countBooking || (room.capacity - countBooking.length <= 0)) throw notFoundError();
  
  const acommodation = acommodadion(room.name, room.capacity);
  const myRoom = { image: hotel.image, hotel: hotel.name, ...acommodation, sharedRoom: (countBooking.length-1) };
  return { id: booking.id, Room: myRoom  };
}

export async function postBookingId(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw Forbidden();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") throw Forbidden();

  const ticketsType = await ticketRepository.ticketsTypeIsPresentialCheck(ticket.ticketTypeId);
  if (!ticketsType) throw Forbidden();

  if (!ticketsType.includesHotel && ticket.status !== "PAID") throw Forbidden();

  const searchBooking = await bookingRepository.searchBookingByRoomId(roomId);
  if (!searchBooking) throw notFoundError();

  const countBooking = await bookingRepository.countBooking(roomId);
  if ((searchBooking.capacity - countBooking.length) <= 0) throw Forbidden();

  const hotel = await hotelsRepository.viewHotel(searchBooking.hotelId);
  if (!hotel) throw Forbidden();

  const room = await hotelsRepository.searchHotelByRoomId(roomId);
  if (!room) throw Forbidden();

  await bookingRepository.postBookingId(userId, roomId);

  const acommodation = acommodadion(room.name, room.capacity,);
  return { hotelName: hotel.name, acommodation, sharedRoom: countBooking.length };
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

  const availabilityRoom = await bookingRepository.searchBookingByRoomId(roomId);
  if (!availabilityRoom) throw notFoundError();

  const countBooking = await bookingRepository.countBooking(roomId);
  if (availabilityRoom.capacity - countBooking.length <= 0) throw Forbidden();

  const updateBooking = await bookingRepository.putBookingId(userId, roomId, bookingId);
  return updateBooking;
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
