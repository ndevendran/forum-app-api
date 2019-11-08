import * as dynamoDbLib from "./libs/dynamodb-lib.js";
import { success, failure } from "./libs/response-lib";
import * as authLib from "./libs/auth-lib.js";

const jwt = require('jsonwebtoken');

async function authorizeEdit(event) {
  const data = JSON.parse(event.body);
  var decoded = jwt.decode(data.idToken);
  const username = decoded['cognito:username'];

  const params = {
    TableName: process.env.tableNameUserPosts,
    Key: {
      postId: event.pathParameters.postId
    }
  };

  const result = await dynamoDbLib.call("get", params);

  if(result.Item) {
    const post = result.Item;
    if(post.posterUsername !== username) {
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

  const post = await dynamoDbLib.call("update", params);
  return success({ status: true, post: post});
}

function handleErrors(error) {
  return failure({ status: false, error: error.message });
}


export async function main(event, context) {
  const data = JSON.parse(event.body);
  if(data.idToken == null) {
    return failure({status: false, error: "Please login..."});
  }

  var authorized = await authorizeEdit(event);
  var verified   = await authLib.verifyToken(event);
  var response = null;

  if(authorized && verified) {
    try {
      response = postEdit(event);
    } catch (e) {
      response = handleErrors(e);
    }
  } else {
    response = handleErrors(new Error("Access Denied"));
  }

  return response;
}
