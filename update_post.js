import * as dynamoDbLib from "./libs/dynamodb-lib.js";
import { success, failure } from "./libs/response-lib";

const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const http  = require('https');

async function getKey() {
  return new Promise(function(resolve, reject) {
    http.get(process.env.publicKeyURL, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        data = JSON.parse(data);
        var pemArray = data["keys"].map((jwkKey) => jwkToPem(jwkKey));
        resolve(pemArray);

      }).on("error", (err) => {
        reject(err);
      });
    });
  });
}

async function verifyToken(event) {
  const keys = await getKey().then(data => {
    return data;
  }).catch(err => {
    throw err;
  });
  const data = JSON.parse(event.body);
  const verified = keys.map((key) => jwt.verify(data.idToken, key, { algorithms: ['RS256']}, function (err, decodedToken) {
    if(err) {
      return false;
    } else {
      return true;
    }
  }));
  for(var i = 0; i<verified.length; i++) {
    if(verified[i]) {
      return true;
    }
  }

  return false;
}

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
  var authorized = await authorizeEdit(event);
  var verified   = await verifyToken(event);
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
