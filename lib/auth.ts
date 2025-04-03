import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyAuth(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return null;
    }

    return { id: user.id };
  } catch (error) {
    return null;
  }
} 