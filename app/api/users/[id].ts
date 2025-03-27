import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the user id from the query parameters
  const userId = parseInt(req.query.id as string);

  switch (req.method) {
    case "GET": {
      // Retrieve a single user by id
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: "Error fetching user" });
      }
      break;
    }
    case "PUT": {
      // Update a user by id
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: req.body, // pass the fields to update, e.g., { name, email }
        });
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: "Error updating user" });
      }
      break;
    }
    case "DELETE": {
      // Delete a user by id
      try {
        await prisma.user.delete({
          where: { id: userId },
        });
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: "Error deleting user" });
      }
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
