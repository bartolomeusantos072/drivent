import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

export async function provideHotelsView(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") {
    throw notFoundError();
  }
  const ticketsType = await ticketRepository.findTicketTypesPresential();
  if (!ticketsType) {
    throw notFoundError();
  }

  if (!ticketsType.length ) throw notFoundError();

  const hotels = await hotelsRepository.viewHotels();
  const rooms = await hotelsRepository.quantityRooms();

  return hotels.map(
    function(hotel: { id?: number; name?: string; image?: string; }) {
      const { name, image } = hotel;
      let avaliables = 0;
      const accommodation: string[] = [];
      if (rooms) {
        for (let i = 0; i < rooms.length; i++) {
          if (rooms[i].hotelId === hotel?.id) {
            avaliables = avaliables + Number(rooms[i]._sum.capacity);
            
            if(rooms[i]._sum.capacity === 1 && accommodation.indexOf("Single")< 0) {
              accommodation.push("Single");
            }
            if(rooms[i]._sum.capacity === 2 && accommodation.indexOf("Double")< 0) {
              accommodation.push("Double");
            }
            if(rooms[i]._sum.capacity === 3 && accommodation.indexOf("Triple")< 0) {
              accommodation.push("Triple");
            }
          }
        }
      }
      return { name, image, accommodation, avaliables };
    });
}

export async function provideHotelsViewId(userId: number, hotelId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID") {
    throw notFoundError();
  }

  const ticketsType = await ticketRepository.findTicketTypes();
  if (!ticketsType && ticketsType.length === 0) {
    throw notFoundError();
  }

  const hotel = await hotelsRepository.searchHotelId(hotelId);
  if (!hotel) {
    throw notFoundError();
  }
  const rooms = await hotelsRepository.searchRooms(hotelId);
  if(!rooms && rooms.length === 0) {
    throw notFoundError();
  }
  return { ...hotel, Room: rooms };
}

const hotelsService = {
  provideHotelsView,
  provideHotelsViewId,
};

export default hotelsService;
