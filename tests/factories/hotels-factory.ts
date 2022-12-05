import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl( 640,  480, "hotel"),
    }
  });
}
export async function createManyHotels() {
  return await prisma.hotel.createMany({
    data: [
      { 
        name: "Driven Resort",
        image: "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png",
      },
      { 
        name: "Driven Palace",
        image: "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png",
      },
      { 
        name: "Driven World",
        image: "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_871,h_581/https://blog.hotelpontaverde.com.br/wp-content/uploads/2019/09/Resort-ou-Hotel-Hotel-Ponta-Verde-France%CC%82s.png",
      },]
  });
}

export async function viewHotels() {
  return await prisma.hotel.findMany({});
}
export async function viewHotel() {
  return await prisma.hotel.findFirst();
}
