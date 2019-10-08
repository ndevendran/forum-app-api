import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";


export async function main(event, context) {
  const params = {
    TableName: "forum",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      postId: event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      //Return the retrieved items
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found."});
    }
  } catch (e) {
    console.log(e);
    return failure({status: false});
  }
}
