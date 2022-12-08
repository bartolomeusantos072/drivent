import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import {  createUser, createEnrollmentWithAddress, createTicket, createPayment, updateTicket, createTicketTypeOnline,  createTicketTypePresential, viewHotels, createManyHotels, viewHotel } from "../factories";
import { TicketStatus } from "@prisma/client";
import { createManyRooms } from "../factories/rooms-factory";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a presential ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    
    it("should respond with status 404 for hotel when user has an online ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeOnline= await createTicketTypeOnline();
      const ticket = await createTicket(enrollment.id, ticketTypeOnline.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, (ticketTypeOnline.price) );
      const update = await updateTicket(ticket.id, TicketStatus.PAID);
      let response;
      if(ticketTypeOnline && payment  && update) {
        response =  await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      }
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 when user has on presential ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypePresential= await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketTypePresential.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, (ticketTypePresential.price) );
      await updateTicket(ticket.id, TicketStatus.PAID);
      await createManyHotels();  
      const hotelsView = await viewHotels();
      let response;
      if(ticketTypePresential.includesHotel && payment) {
        response =  await server.get("/hotels").set("Authorization", `Bearer ${token}`).send(hotelsView);
      }
      
      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/:hotelId");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a presential ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    
    it("should respond with status 404 for hotel when user has an online ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeOnline= await createTicketTypeOnline();
      const ticket = await createTicket(enrollment.id, ticketTypeOnline.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, (ticketTypeOnline.price) );
      const update = await updateTicket(payment.ticketId, TicketStatus.PAID);
      const response =  await server.get(`/hotels/${null}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 400 when user has on presential ticket and rooms view", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypePresential= await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketTypePresential.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, (ticketTypePresential.price) );
      await updateTicket(ticket.id, TicketStatus.PAID);
      const hotel =await viewHotel();
      await createManyRooms(hotel.id);
      const hotelOther = -1;
  
      const response =  await server.get(`/hotels/${hotelOther}`).set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 when user has on presential ticket and rooms view", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypePresential= await createTicketTypePresential();
      const ticket = await createTicket(enrollment.id, ticketTypePresential.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, (ticketTypePresential.price) );
      await updateTicket(ticket.id, TicketStatus.PAID);
      const hotel = await viewHotel();
      await createManyRooms(hotel.id);
  
      let response;
      if(ticketTypePresential.includesHotel) {
        response =  await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      }
      
      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});
