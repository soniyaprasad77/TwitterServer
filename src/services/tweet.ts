import { prismaClient } from "../clients/db";
import { redisClient } from "../clients/redis";

export interface createTweetPayload {
    content: 'string';
    imageURL?: 'string';
    userId: string;
}

export class TweetService {
    public static createTweet = async (data: createTweetPayload) => {
        await redisClient.get('ALL_TWEETS');    
        const tweet = prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                author: { connect: { id: data.userId } }
            },
        })
        await redisClient.del('ALL_TWEETS');
        return tweet;
    }
    public static getAllTWeets = async () =>{
        const cachedTweets = await redisClient.get('ALL_TWEETS');
        if(cachedTweets){
            return JSON.parse(cachedTweets);
        }
        const tweets = await prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
        await redisClient.set('ALL_TWEETS',JSON.stringify(tweets));
        return tweets;
    }
}

export default TweetService;
