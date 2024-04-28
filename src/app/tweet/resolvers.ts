import { connect } from "react-redux";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { Tweet } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface createTweetPayload {
    content: 'string';
    imageURL?: 'string'
}
//console.log("env" + process.env.AWS_ACCESS_KEY)
const s3Client = new S3Client({
    region:'ap-south-1',
    credentials: {
      accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
      secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
    },
  });

const queries = {
    getAllTweets: async () => {
        return prismaClient.tweet.findMany({ orderBy: { createdAt: 'desc' } });
    },
    getSignedURLForTweet: async (
        parent: any,
        { imageType, imageName }: { imageType: string ; imageName:string},
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
            Bucket:'soniya-twitter-dev',
            Key:`uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`, 
        });

        const signedURL = await getSignedUrl(s3Client, putObjectCommand);
        return signedURL;
    }
}
const mutations = {
    createTweet: async (
        parent: any,
        { payload }: { payload: createTweetPayload },
        ctx: GraphqlContext) => {
        if (!ctx.user) {
            throw new Error('Unauthorized');
        }
        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL,
                author: { connect: { id: ctx.user.id } }

            }
        })
        return tweet;
    }
}

export const extraResolvers = {
    Tweet: {
        author: (parent: Tweet) => {
            return prismaClient.user.findUnique({ where: { id: parent.authorId } })
        }
    }
}

export const resolvers = { mutations, extraResolvers, queries }