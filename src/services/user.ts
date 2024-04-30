import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTService from "./jwt";
import { redisClient } from "../clients/redis";

interface GoogleTokenResult {
    iss?: string;
    azp?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: boolean;
    nbf?: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}
class UserService {
    public static async verifyGoogleAuthToken(token: string) {
        const googleToken = token;
        const googleOauthURL = new URL('https://oauth2.googleapis.com/tokeninfo');
        googleOauthURL.searchParams.set("id_token", googleToken);

        const { data } = await axios.get<GoogleTokenResult>(googleOauthURL.toString(), {
            responseType: "json"
        });
        console.log("data: " + data);
        const user = await prismaClient.user.findUnique(
            {
                where: {
                    email: data.email,
                }
            }
        )

        if (!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name ?? "",
                    lastName: data.family_name,
                    profileImageURL: data.picture
                }
            })
        }
        const userInDB = await prismaClient.user.findUnique({
            where: { email: data.email }
        })
        if (!userInDB) throw new Error("User not found")
        const userToken = JWTService.generateTokenForUser(userInDB)
        console.log("userToken " + userToken)
        return userToken;
    }
    public static async getUserById(id: string) {
        const cachedUser = await redisClient.get(`USER:${id}`);
        if(cachedUser){
            return JSON.parse(cachedUser)
        }
        const result = await prismaClient.user.findUnique({
            where: { id }
        })
        await redisClient.set(`USER:${id}`, JSON.stringify(result));
        return result;
    }
    
    public static async followUser(from: string, to: string) {
        const result = await prismaClient.follows.create({
            data: {
                follower: { connect: { id: from } },
                following: { connect: { id: to } }
            }
        })
        await redisClient.del(`USER:${to}`);
        return result;
    }
    
    public static async unfollowUser(from:string, to:string){
        const result = await prismaClient.follows.delete({
            where:{
                followerId_followingId:{
                    followerId: from,
                    followingId: to
                }
            }
        })
        await redisClient.del(`USER:${to}`);
        return result;
    }
}
export default UserService;
