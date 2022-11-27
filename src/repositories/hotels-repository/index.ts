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
  return await prisma.hotel.findMany({ });
}
async function viewRooms(hotelId: number) {
  return await prisma.room.findMany({
    where: {
      hotelId,
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
const hotelsRepository = {
  viewHotels,
  viewRooms,
  quantityRooms,
  searchHotelId,

};
export default hotelsRepository;
