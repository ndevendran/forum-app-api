import * as dynamoDbLib from "./libs/dynamodb-lib.js";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableNameUserPosts,
    Key: {
      postId: event.pathParameters.postId
    },
    UpdateExpression: "SET content = :content, title = :title",
    ExpressionAttributeValues: {
      ":title": data.title || null,
      ":content": data.content || null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const post = await dynamoDbLib.call("update", params);
    return success({ status: true, post: post });
  } catch (e) {
    console.log(e);
    return failure({ status: false, error: e });
  }
}
