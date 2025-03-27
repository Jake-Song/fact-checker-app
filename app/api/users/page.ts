// pages/api/users/[id].ts for GET, PUT, DELETE on a specific user
// pages/api/users/index.ts for POST (create) and GET (list) all users

// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      // List all users
      try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
      }
      break;
    }
    case "POST": {
      // Create a new user
      try {
        const newUser = await prisma.user.create({
          data: req.body, // ensure your body has { name, email }
        });
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ error: "Error creating user" });
      }
      break;
    }
    // default:
    //   res.setHeader("Allow", ["GET", "POST"]);
    //   res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
