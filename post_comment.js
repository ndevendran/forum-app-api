import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";


export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableNameComments,
    Item: {
      commentId: uuid.v1(),
      postId: event.pathParameters.id,
      content: data.content,
      username: data.username,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (error) {
    console.log(error.message);
    return failure({status: false});
  }
}
