import * as dynamoDbLib from './libs/dynamodb-lib.js';
import {success, failure} from './libs/response-lib';
import * as authLib from './libs/auth-lib.js';

const jwt = require('jsonwebtoken');

async function authorizeEdit(event) {
  const data = JSON.parse(event.body);
  var decoded = jwt.decode(data.idToken);
  const username = decoded['cognito:username'];

  const params = {
    TableName: process.env.tableNameComments,
    Key: {
      postId: event.pathParameters.postId,
      commentId: event.pathParameters.commentId
    }
  };

  const result = await dynamoDbLib.call("get", params);

  if(result.Item) {
    const comment = result.Item;
    if(comment.username !== username) {
      throw new Error("Access Denied");
    } else {
      return {event: event, data: data};
    }
  } else {
    throw new Error("Item not found");
  }
}

async function postEdit(event) {
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableNameComments,
    Key: {
      postId: event.pathParameters.postId,
      commentId: event.pathParameters.commentId
    },
    UpdateExpression: "SET content = :content",
    ExpressionAttributeValues: {
      ":content": data.content || null
    },
    ReturnValues: "ALL_NEW"
  };

  const result = await dynamoDbLib.call("update", params);
  return success({ status: true, comment: result});
}

function handleErrors(error) {
  return failure({ status: false, error: error.message });
}

export async function main(event, context) {
  const data = JSON.parse(event.body);
  if(data.idToken == null) {
    return failure({status: false, error: "Please login..."});
  }

  var response = null;

  try {
    var authorized = await authorizeEdit(event);
    var verified   = await authLib.verifyToken(event);
  } catch(e) {
    response = handleErrors(e);
  }

  if(authorized && verified) {
    try {
      response = postEdit(event);
    } catch (e) {
      response = handleErrors(new Error("Internal Server Error"));
    }
  } else {
    response = handleErrors(new Error("Access Denied"));
  }

  return response;
}
