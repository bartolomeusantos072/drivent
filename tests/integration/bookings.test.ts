import app, { init } from "@/app";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken"; 
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createHotel, createTicket, createTicketTypePresential, createUser } from "../factories";
import { 
  countBooking,
  countBookingByRoom,
  countRooms,
  createBooking,
  createManyBooking,
  findBooking,
  findBookingByRoom
} from "../factories/bookings-factory";

import { createRoom, seachRoom } from "../factories/rooms-factory";
import { prisma } from "@/config";
import { json, Request } from "express";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

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

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 403 if user no exist", async () => {
    const userId = Number(faker.random.numeric(1)) * -1 || 0;
    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET);
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should respond with status 404 when the user has multiple bookings", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      await createBooking(user.id, room.id );
      await createBooking(user.id, room.id );
      const qtdeBooking = await countBooking(user.id);
      
      expect(qtdeBooking).toBeGreaterThan(1);
      expect(result.status).toBe(404);
    });
    it("should respond with status 404 when the user has not bookings", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userId = Number(faker.random.numeric(1)) * -1;
      const qtdeBooking = await countBooking(userId);
      const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      
      expect(qtdeBooking).toBeLessThan(1);
      expect(result.status).toBe(404);
    });
    it("should respond with status 200 when the user has unique a booking", async () => { 
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id );
      const bookingShared = await countBookingByRoom(room.id);
      const acommodation = acommodadion(room.name, room.capacity);
      const myRoom = { image: hotel.image, hotel: hotel.name, ...acommodation, sharedRoom: (bookingShared-1) };
      const result = await supertest(app).get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({ id: expect.any(Number), Room: expect.any(Object) });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: faker.random.numeric(1) });
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: faker.random.numeric(1) });
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when body is valid", () => {
    it("should respond with status 200 ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const body = { roomId: room.id };
    
      const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(result.status).toEqual(httpStatus.OK);
      expect(result.text).toEqual(expect.any(String));
    });
    it("should respond with status 403 ", async () => {
      const user2 = await createUser();
      const hotel = await createHotel();
      const mRoom = await prisma.room.create({
        data: {
          name: faker.random.numeric(1)+0+faker.random.numeric(1),
          capacity: 1,
          hotelId: hotel.id,
        },
      });
      await createBooking(user2.id, mRoom.id);
      const countBooking = mRoom.capacity - await countBookingByRoom(mRoom.id);
      const body = { roomId: mRoom.id };
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect( result.status).toEqual(httpStatus.FORBIDDEN);
    });
  });

  describe("when body is invalid", () => {
    it("should respond with status 404 if body owns other property", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { [faker.lorem.word()]: faker.lorem.word() };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body); 
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 if body is empty", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { };
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body); 
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 when roomId no exist because it is less than or equal to zero", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: (Number(faker.random.numeric(1)) * -1)+"" };
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${ token }`).send(body);
      const checkRoom = await countBookingByRoom(Number(body.roomId));
    
      expect(checkRoom).toBeLessThanOrEqual(0);
      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put(`/booking/${faker.random.numeric(1)}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.put(`/booking/${faker.random.numeric(1)}`).set("Authorization", `Bearer ${token}`).send({ roomId: faker.random.numeric(1) });
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.put(`/booking/${faker.random.numeric(1)}`).set("Authorization", `Bearer ${token}`).send({ roomId: faker.random.numeric(1) });
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 400 if bookingId is invalid", async () => {
    const user = await createUser();
    const token = await generateValidToken();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypePresential();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const body = { roomId: room.id };

    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);
    
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe("when bookingId is valid", () => {
    describe("when body is valid",  () => {
      it("should respond with status 200 ", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypePresential();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        const bookingId = (await createBooking(user.id, room.id)).id;
        const body = { roomId: room.id };
        const result = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`).send(body);
        
        expect(result.status).toEqual(httpStatus.OK);
        expect(result.text).toEqual(expect.any(String));
      });
      it("should respond with status 403 ", async () => {
        const user2 = await createUser();
        const hotel = await createHotel();
        const mRoom = await prisma.room.create({
          data: {
            name: faker.random.numeric(1)+0+faker.random.numeric(1),
            capacity: 1,
            hotelId: hotel.id,
          },
        });
        const booking = await createBooking(user2.id, mRoom.id);
        const countBooking = mRoom.capacity - await countBookingByRoom(mRoom.id);
        const body = { roomId: mRoom.id };
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypePresential();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const result = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
        expect( result.status).toEqual(httpStatus.FORBIDDEN);
      });
    });
  
    describe("when body is invalid", () => {
      it("should respond with status 404 if body owns other property", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        const bookingId = (await createBooking(user.id, room.id)).id;
        const body = { [faker.lorem.word()]: faker.lorem.word() };
        const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`).send(body); 
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it("should respond with status 404 if body is empty", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        const bookingId = (await createBooking(user.id, room.id)).id;
        const body = { };
    
        const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`).send(body); 
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
      it("should respond with status 404 when roomId no exist because it is less than or equal to zero", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        const bookingId = (await createBooking(user.id, room.id)).id;
        const body = { roomId: (Number(faker.random.numeric(1)) * -1)+"" };
    
        const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${ token }`).send(body);
        const checkRoom = await countBookingByRoom(Number(body.roomId));
      
        expect(checkRoom).toBeLessThanOrEqual(0);
        expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
      });
    });
  });
});
