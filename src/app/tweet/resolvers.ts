import { connect } from "react-redux";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { Tweet } from "@prisma/client";

interface createTweetPayload {
    content: 'string';
    imageURL?: 'string'
}

const queries = {
    getAllTweets: async () => {
        return prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}});
    }
}
const mutations = {
    createTweet : async(
        parent: any,
        {payload}: { payload: createTweetPayload }, 
        ctx: GraphqlContext) => {
            if(!ctx.user){
                throw new Error('Unauthorized');
            }
           const tweet =  await prismaClient.tweet.create({
                data: {
                    content: payload.content, 
                    imageURL: payload.imageURL,
                    author:{connect:{ id: ctx.user.id}}
                    
                }
            })
            return tweet;
}
}

export const extraResolvers = {
    Tweet:{
        author: (parent: Tweet) =>{
            return prismaClient.user.findUnique({where: {id: parent.authorId}})
        }
    }
}

export const resolvers = {mutations, extraResolvers, queries}