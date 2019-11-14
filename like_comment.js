import * as dynamoDbLib from './libs/dynamodb-lib.js';
import {success, failure} from './libs/response-lib.js';
import uuid from "uuid";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  const scanParams = {
    TableName: process.env.tableNameCommentLikes,
    ProjectionExpression: "postId, commentId, username",
    FilterExpression: "postId = :pid and commentId = :cid and username = :username",
    ExpressionAttributeValues: {
      ":pid": event.pathParameters.postId,
      ":cid": event.pathParameters.commentId,
      ":username": data.username
    }
  };

  const putParams = {
    TableName: process.env.tableNameCommentLikes,
    Item: {
      likeId: uuid.v1(),
      postId: event.pathParameters.postId,
      commentId: event.pathParameters.commentId,
      username: data.username,
      createdAt: Date.now(),
      like: data.like
    }
  };

  try {
    const result = await dynamoDbLib.call("scan", scanParams);
    if (result.Count > 0) {
      return failure({status: false, error: "Already liked this comment..."});
    } else {
      await dynamoDbLib.call("put", putParams);
      return success({status: true});
    }
  } catch(error) {
    return failure({status: false, error: error.message});
  }
}
