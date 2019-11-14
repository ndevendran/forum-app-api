import {success, failure} from './libs/response-lib.js';
import * as dynamoDbLib from './libs/dynamodb-lib.js';


export async function main(event, context, callback) {
  const scanParams = {
    TableName: process.env.tableNameCommentLikes,
    FilterExpression: "postId = :pid and commentId = :cid",
    ExpressionAttributeValues: {
      ":pid" : event.pathParameters.postId,
      ":cid" : event.pathParameters.commentId,
    }
  };

  try {
    const results = await dynamoDbLib.call("scan", scanParams);
    var likeCount = 0;
    var dislikeCount = 0;
    for (var item in results.Items) {
      if(results.Items[item].like) {
        likeCount++;
      } else {
        dislikeCount++;
      }
    }

    var totalLikes = likeCount - dislikeCount;

    return success({status: true, likes: totalLikes});
  } catch (error) {
    return failure({status: false, error: error.message});
  }
}
