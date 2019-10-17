import * as dynamoDbLib from './libs/dynamodb-lib.js';
import {success, failure} from './libs/response-lib.js';

export async function main(event, context) {

  const params = {
      TableName: process.env.tableNameComments,
      KeyConditionExpression: "#id = :idstring",
      ExpressionAttributeNames: {
        "#id": "postId"
      },
      ExpressionAttributeValues: {
        ":idstring": event.pathParameters.postId
      }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    if (result.Items) {
      //Return the retrieved items
      return success(result.Items);
    } else {
      return failure({ status: false, error: "Item not found."});
    }
  } catch (e) {
    console.log(e);
    return failure({status: false, error: e});
  }
}
