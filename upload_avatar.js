import AWS from "aws-sdk";
import { success, failure } from './libs/response-lib.js';

// var fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

export async function main(event, context, callback) {
  //Extract file data and place into bucket
  const data = JSON.parse(event.body);
  var regex = /^data:.+\/(.+);base64,(.*)$/;

  var matches = data.file.match(regex);
  var ext = matches[1];
  var fileData = matches[2];

  //Get user data from id token
  var decoded = jwt.decode(data.idToken);
  const storeKey = decoded['cognito:username'] + process.env.avatarFileName + '.' + ext;
  const sub = decoded['sub'];

  //Set up bucket transfer
  const buffer = Buffer.from(fileData, 'base64');
  const params = {Bucket: process.env.bucketName, Key: storeKey, Body: buffer};
  const s3 = new AWS.S3();
  var errorINeed = null;
  var dataMaybe;

  var promise = new Promise(function(resolve, reject) {
    try {
      s3.putObject(params, async (err, data) => {
        if(err) {
          console.log(err, err.stack);
          reject(err);
        } else {
          console.log(data);
          resolve(data);
        }
      });
    } catch(error) {
      reject(error);
    }
  });

  await promise.then(function(data) {
    dataMaybe = data;
  }, function(err) {
    errorINeed = err;
  });

  if(errorINeed) {
    return failure({status: false, error: errorINeed});
  } else {
    return success({status: true, data: dataMaybe});
  }
}
