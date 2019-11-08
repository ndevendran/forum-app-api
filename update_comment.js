import * as dynamoDbLib from './libs/dynamodb-lib.js';
import {success, failure} from './libs/response-lib';
import * as authLib from './libs/auth-lib.js';

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableNameComments,
    Key: {
      "postId": event.pathParameters.postId,
      "commentId": event.pathParameters.commentId
    },
    UpdateExpression: "SET content = :content",
    ExpressionAttributeValues: {
      ":content": data.content || null,
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call('update', params);
    return success({ status: true, comment: result });
  } catch(e) {
    return failure({ status: false, error: e });
  }


}
