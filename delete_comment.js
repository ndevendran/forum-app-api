import * as dynamoDbLib from './libs/dynamodb-lib.js';
import { success, failure } from './libs/response-lib';


export default main(event, context) {
  const params = {
    Key: {
      commentId: event.pathParameters.commentId,
      postId: event.pathParameters.postId
    }
  };

  try {
    await dynamoDbLib.call('delete', params);
    return success({ status: true });
  } catch(e) {
    console.log(e);
    return failure({ status: false });
  }
}
