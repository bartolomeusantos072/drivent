
import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.random.numeric(1)+0+faker.random.numeric(1),
      capacity: Math.floor(Math.random() * (4 - 1) + 1),
      hotelId,
    },
  });
}

export async function createManyRooms(hotelId: number) {
  return  await prisma.room.createMany({
    data: [
      {  name: "Single", capacity: 6, hotelId, },
      {  name: "Double", capacity: 6, hotelId, },
      {  name: "Triple", capacity: 2, hotelId, },
    ]
  });
}

export async function quantityRooms(hotelId: number) {
  return await prisma.room.groupBy({
    where: {
      hotelId,
    },
    by: [ "hotelId", "name"],
    _sum: {
      capacity: true,
    },
  });
}

export async function checkAvailabilityRoom(roomId: number) {
  return prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });
}

export async function seachRoom(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
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
