import { Hotel, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
dotenv.config()

const prisma = new PrismaClient();

async function main() {



  let hotel = await prisma.hotel.findFirst();
   if(!hotel){
     await prisma.hotel.createMany({
      data:[
        { 
         name: 'Driven Resort',
         image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png',
        },
        { 
          name: 'Driven Palace',
          image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png',
         },
         { 
          name: 'Driven World',
          image: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png',
         },]
    });
  }

  let roomsInHotel = await prisma.room.findFirst();
  if(!roomsInHotel){
     await prisma.room.createMany({
      data : [
        {  name: 'Single', capacity: 6, hotelId: 1 },
        {  name: 'Double', capacity: 6, hotelId: 1 },
        {  name: 'Triple', capacity: 2, hotelId: 1 },
        {  name: 'Single', capacity: 15, hotelId: 2 },
        {  name: 'Double', capacity: 6, hotelId: 2 },
        {  name: 'Triple', capacity: 4, hotelId: 2 },
        {  name: 'Single', capacity: 1, hotelId: 3 },
        {  name: 'Double', capacity: 2, hotelId: 3 },
        {  name: 'Triple', capacity: 3, hotelId: 3 },
      ]
    });
  }

  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }

  let user = await prisma.user.findFirst();
  if (!user) {
    const myPassword = await bcrypt.hash("123456", 12);
    user = await prisma.user.create({
      data: {
        email: "nayane@gmail.com",
        password: myPassword,
      },
    })
  }

  let enrollments = await prisma.enrollment.findFirst();
  if (!enrollments) {
    enrollments = await prisma.enrollment.create({
      data: {
        name: "Nayane Fernades",
        cpf: "12345678910",
        birthday: "1995-11-23T22:51:10.132Z",
        phone: "32987654321",
        userId: user.id,
        Address: {
          create: {
            cep: "36500000",
            street: "Rua Marques de pombal",
            city: "Ubá",
            state: "Minas Gerais",
            number: "150",
            neighborhood: "Mercado BH",
            addressDetail: "fundos",
          }
        },
      },
    });
  }

  let ticketType = await prisma.ticketType.findFirst();
  if (!ticketType) {
    ticketType = await prisma.ticketType.create({
     data: { 
      name: event.title + "ticket",
      price: 250,
      isRemote: true,
      includesHotel: true,
    },
    })
    
  }

  let mValue = 0
  if (ticketType.includesHotel){
      mValue = 350
  }
 
  let ticket = await prisma.ticket.findFirst();
  if (!ticket) {
    ticket = await prisma.ticket.create({
     data: { 
      ticketTypeId: ticketType.id,
      enrollmentId: enrollments.id,
      status: "RESERVED",}
    })
  }

  let payments = await prisma.payment.findFirst();
  if(!payments) {
    payments = await prisma.payment.create({
      data: {
        ticketId: ticket.id,
        value: ticketType.price + mValue ,
        cardIssuer: "MASTERCARD" ,
        cardLastDigits: "1234",
      },
    })
  }
 
  let statusTicket = await prisma.ticket.findFirst();
  if(statusTicket && payments){
    statusTicket = await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: "PAID",
      }
    })
  }

  // select "Hotel"."name", image, "Room"."name", "Room".capacity from "Hotel" JOIN "Room" on "Hotel"."id"="Room"."hotelId";
  let result = await prisma.hotel.findMany({ })

  let totalRoom = await prisma.room.groupBy({
    by: ['hotelId','name'],
    _sum: {
      capacity: true,
    },
  })
  
  let avaliables: number = 0;
  let accommodation: string[]= [];
  if(totalRoom){
    for(let i=0;i<totalRoom.length;i++){
      if(totalRoom[i].hotelId===hotel?.id){
         avaliables = avaliables + Number(totalRoom[i]._sum.capacity)
        accommodation.push( totalRoom[i].name.toString() );
      }
     }
  }
  console.log(hotel, "Tipos de acomodacao :",accommodation, "Vagas disponiveis: ", avaliables)
  console.log(await prisma.room.findMany({
    where:{
      hotelId:hotel?.id,
    }
  }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
