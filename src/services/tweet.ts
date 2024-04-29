import { prismaClient } from "../clients/db";

export interface createTweetPayload {
    content: 'string';
    imageURL?: 'string';
    userId: string;
}

export class TweetService {
    public static createTweet = async (data: createTweetPayload) => {
        return prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                author: { connect: { id: data.userId } }
            },
        })
    }
    public static getAllTWeets = async () =>{
        return prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
    }
}

export default TweetService;
