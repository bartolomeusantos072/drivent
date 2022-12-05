import app, { init } from "@/app";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken"; 
import { cleanDb, generateValidToken } from "../helpers";
import { createHotel, createUser } from "../factories";
import { countBooking, countBookingByRoom, countRooms, createBooking, findBooking, findBookingByRoom } from "../factories/bookings-factory";
import { createRoom, seachRoom } from "../factories/rooms-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});
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
  describe("when token is valid", () => {
    it("should respond with status 200 when the user has unique a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id );
      const viewBooking = await findBooking(booking.id);
      const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      
      expect(viewBooking.id).toBe(booking.id);
      expect(result.statusCode).toBe(httpStatus.OK);
    });
    it("should respond with status 404 when the user has multiple bookings", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id );
      await createBooking(user.id, room.id );
      const qtdeBooking = await countBooking(user.id);
      const result = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      
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
  });
});

describe("POST /booking", () => {
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
    it("should respond with status 404 when roomId no exist because the room number is bigger than the apartment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const roomIdFalse = room.id+6;
      const body = { roomId: roomIdFalse+"" };
      const response = await server.post("/booking").set("Authorization", `Bearer ${ token }`).send(body);
      const viewBooking = await seachRoom(Number(body.roomId));
      expect(viewBooking).toBeNull();
      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });
  });
});
