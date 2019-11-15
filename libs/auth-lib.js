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

export async function verifyToken(event) {
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
