import * as dynamoDbLib from "./libs/dynamodb-lib.js";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "forum",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      postId: event.pathParameters.id
    },
    UpdateExpression: "SET content = :content, title = :title",
    ExpressionAttributeValues: {
      ":title": data.title || null,
      ":content": data.content || null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
