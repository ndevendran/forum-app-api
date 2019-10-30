import AWS from "aws-sdk";
import { success, failure } from './libs/response-lib.js';

// var fetch = require('node-fetch');

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const s3 = new AWS.S3();

  try {
    const s3 = new AWS.S3();
    const storeKey = event.requestContext.user + process.env.avatarFileName;
    const params = {Bucket: process.env.bucketName, Key: storeKey, Body: data.file};

    const result = await s3.putObject(params);
    return success({status: true, result: result});
  } catch (e) {
    return failure({status: false, error: "This is where it's failing!"});
  }

}
