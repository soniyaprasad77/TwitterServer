import dotenv from 'dotenv';
dotenv.config();
import JWT from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JWTUser } from '../interfaces';

class JWTService {
     public static generateTokenForUser(user: User){
        if(!user){
            throw new Error("User not found")
        }
        const payload: JWTUser = {
            id: user.id,
            email:user.email
        }
        const secret = process.env.JWT_SECRET || ""; // Ensuring JWT_SECRET is not undefined
        const token = JWT.sign(payload, secret);
        return token;
     }
     public static decodeToken(token: string){
       try{
        return JWT.verify(token, process.env.JWT_SECRET || "") as JWTUser;
       }
       catch(err){
           return null;
       }
     }
}

export default JWTService;