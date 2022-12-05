import { prisma } from "@/config";

async function quantityRooms() {
  return await prisma.room.groupBy({
    by: ["hotelId", "name"],
    _sum: {
      capacity: true,
    },
  });
}
async function viewHotels( ) {
  return await prisma.hotel.findMany({});
}
async function searchRooms(hotelId: number) {
  return await prisma.room.findMany({
    where: {
      hotelId,
    }
  });
}
async function searchHotelByRoomId(idRoom: number) {
  return await prisma.room.findUnique({
    where: {
      id: idRoom,
    }
  });
}
async function searchHotelId(hotelId: number) {
  return await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    }
  });
}
async function viewHotel(hotelId: number) {
  return await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
  });
}
async function countRoom(hotelId: number) {
  return prisma.room.count({
    where: {
      hotelId,
    }
  });
}
const hotelsRepository = {
  viewHotels,
  quantityRooms,
  searchHotelId,
  viewHotel,
  searchRooms,
  searchHotelByRoomId,
  countRoom
};
export default hotelsRepository;
