import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { Tweet, User } from "@prisma/client";
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

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
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
                    firstName: data.given_name,
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
    },
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        console.log(ctx);
        const id = ctx.user?.id;
        if (!id) return null;
        const user = await prismaClient.user.findUnique({ where: { id } })
        console.log(user)
        return user;
    },
    getUserById: async (parent: any, { id }: { id: string }, ctx: GraphqlContext) => prismaClient.user.findUnique({
        where: { id }
    })

}

const extraResolvers = {
    User: {
        tweets: (parent: User) => {
            return prismaClient.tweet.findMany({ where: { author: { id: parent.id } } })
        }
    }
}

export const resolvers = { queries, extraResolvers }