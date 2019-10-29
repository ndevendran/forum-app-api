import AWS from "aws-sdk";
import { success, failure } from './libs/response-lib.js';

export async function main() {
  const s3 = new AWS.S3();
  const storeKey = event.requestContext.user + process.env.avatarFileName;
  const params = {Bucket: process.env.bucketName, Key: storeKey, Body: data.file };
  s3.upload(params, (err, data) => {
    if (error) {
      return failure({status: false, error: error});
    }

    return success({storeKey: storeKey });
  });
}
