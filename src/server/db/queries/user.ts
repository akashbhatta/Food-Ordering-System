import { db } from "../index";

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      restaurant: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}
