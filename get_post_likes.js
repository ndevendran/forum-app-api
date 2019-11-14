import {success, failure} from './libs/response-lib.js';
import * as dynamoDbLib from './libs/dynamodb-lib.js';


export async function main(event, context, callback) {
  const scanParams = {
    TableName: process.env.tableNamePostLikes,
    FilterExpression: "postId = :pid",
    ExpressionAttributeValues: {
      ":pid" : event.pathParameters.postId,
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
