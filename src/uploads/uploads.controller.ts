import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import * as AWS from 'aws-sdk'

@Controller("uploads")
export class UploadsController{
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file){
        AWS.config.update({ 
            credentials: {
                accessKeyId: process.env.AWS_S3_ACCESS_KEY,
                secretAccessKey: process.env.AWS_S3_SECRET_KEY
            }
        })
        try{
            const objectName = `${Date.now()+file.originalname}` 
            await new AWS.S3().putObject({
                Body: file.buffer,
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: objectName
            }).promise()
            const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${objectName}`
            return {url: fileUrl}
        }catch(e){
            return null
        }
    }
}