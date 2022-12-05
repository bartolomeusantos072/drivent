import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number) {  
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function countBooking(userId: number) {
  if(userId <=0) {
    return 0;
  }
  
  return prisma.booking.count({
    where: {
      userId,
    }
  });
}

export async function findBooking(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
    }
  });
}

export async function findBookingByRoom(roomId: number) {
  return prisma.booking.findFirst({
    where: {
      roomId,
    }
  });
}
export async function countRooms(hotelId: number) {
  return prisma.room.count({
    where: {
      hotelId,
    }
  });
}
export async function countBookingByRoom(roomId: number) {
  if(roomId <= 0) {
    return 0;
  }
  return prisma.booking.count({
    where: {
      roomId,
    }
  });
}
