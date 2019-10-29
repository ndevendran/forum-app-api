import * as dynamoDbLib from './libs/dynamodb-lib.js';
import { success, failure } from './libs/response-lib.js';


export async function main(event, context, callback) {
    const params = {
      TableName: process.env.tableNameComments,
      Key: {
        commentId: event.pathParameters.commentId,
        postId: event.pathParameters.postId,
      }
    };

    try {
      console.log(event);
      const result = await dynamoDbLib.call("get", params);
      if(result.Item) {
        return success(result.Item);
      }
      else {
        return failure({status: false, error: 'Item not found'});
      }
    } catch(e) {
      console.log(e.message);
      return failure({status: false });
    }
}
