import dotenv from 'dotenv';
dotenv.config();
import JWT from 'jsonwebtoken';
import { prismaClient } from '../clients/db';
import { User } from '@prisma/client';

class JWTService {
     public static generateTokenForUser(user: User){
        if(!user){
            throw new Error("User not found")
        }
        const payload = {
            id: user.id,
            email:user.email
        }
        const secret = process.env.JWT_SECRET || ""; // Ensuring JWT_SECRET is not undefined
        const token = JWT.sign(payload, secret);
        return token;
     }
}

export default JWTService;