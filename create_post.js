import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
    TableName: "forum",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      postId: uuid.v1(),
      content: data.content,
      title: data.title,
      createdAt: Date.now(),
      posterEmail: data.posterEmail,
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({status: false});
  }
}
