import * as dynamoDbLib from './libs/dynamodb-lib.js';
import {success, failure} from './libs/response-lib.js';


export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  const getParams = {
    TableName: process.env.tableNamePostLikes,
    Key: {
      postId: event.pathParameters.postId,
      username: data.username
    }
  };

  const putParams = {
    TableName: process.env.tableNamePostLikes,
    Item: {
      postId: event.pathParameters.postId,
      username: data.username,
      createdAt: Date.now(),
      like: data.like
    }
  };

  try {
    const result = await dynamoDbLib.call("get", getParams);
    if (result.Item) {
      return failure({status: false, error: "Already liked this post..."});
    } else {
      dynamoDbLib.call("put", putParams);
      return success({status: true});
    }

  } catch(err) {
    return failure({status: false, error: err.message});
  }
}
