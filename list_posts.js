import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: "forum",
  };

  try {
    const result = await dynamoDbLib.call("scan", params);

    return success(result.Items);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
