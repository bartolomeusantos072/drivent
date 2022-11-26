import { prisma } from "@/config";

async function viewRooms() {
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
const hotelsRepository = {
  viewHotels,
  viewRooms,

};
export default hotelsRepository;
