import { connect } from "react-redux";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { Tweet } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { createTweetPayload } from "../../services/tweet";


//console.log("env" + process.env.AWS_ACCESS_KEY)
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
        secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
    },
});

const queries = {
    getAllTweets: async () => {
        return TweetService.getAllTWeets();
    },
    getSignedURLForTweet: async (
        parent: any,
        { imageType, imageName }: { imageType: string; imageName: string },
        ctx: GraphqlContext
    ) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error('Unauthenticated');
        }
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedImageTypes.includes(imageType)) {
            throw new Error('Invalid Image Type');
        }
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
        });

        const signedURL = await getSignedUrl(s3Client, putObjectCommand);
        return signedURL;
    }
}
const mutations = {
    createTweet: async (
        parent:any,
        { payload }: { payload: createTweetPayload },
        ctx: GraphqlContext) => {
        if (!ctx.user) {
            throw new Error('You are not authenticated');
        }
        const tweet = await TweetService.createTweet({...payload, userId:ctx.user.id});
        return tweet;
    }
}

export const extraResolvers = {
    Tweet: {
        author: (parent: Tweet) => {
            return UserService.getUserById(parent.authorId);
        }
    }
}

export const resolvers = { mutations, extraResolvers, queries }