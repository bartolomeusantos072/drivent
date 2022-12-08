
import { prisma } from "@/config";

async function getBookingId(userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    }
  });
  return booking;
}
async function searchBookingByRoomId( roomId: number) {
  return prisma.room.findUnique({
    where: {
      id: roomId
    },
  });
}
async function searchBookingId( bookingId: number) {
  return prisma.booking.findUnique({
    where: {
      id: bookingId
    },
  });
}

async function searchBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    }
  });
}

async function countBooking(roomId: number) {
  return prisma.booking.count({
    where: {
      roomId
    },
  });
}

async function countBookingByUserId(userId: number) {
  return prisma.booking.count({
    where: {
      userId
    }
  });
}

async function postBookingId(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    }
  });
}

async function putBookingId(userId: number, roomId: number, bookingId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      userId,
      roomId,
    },
  });
}
const bookingRepository = {
  getBookingId,
  searchBookingByRoomId,
  searchBookingId,
  searchBookingByUserId,
  countBookingByUserId,
  countBooking,
  postBookingId,
  putBookingId
};

export default bookingRepository;
