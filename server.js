const express = require('express');
const request = require('request');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/test', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
}); 

app.get('/key-usage', (req, res) => {
  console.log("in get /key-usage");

  // curl --request GET 'https://admin.pubnub.com/api/v4/services/usage/legacy/usage?key_id=<key_id>&usageType=<usage_type>&file_format=json&start=<start_data>&end=<end_date>' \
  // --header 'X-Session-Token: <session_token>'

  const options = {
    'url': `https://admin.pubnub.com/api/v4/services/usage/legacy/usage?key_id=${req.query.keyid}&usageType=transaction&file_format=json&start=2022-11-01&end=2022-11-30`,
    'headers': { 'X-Session-Token': req.query.token } 
  };

  console.log("key-usage options:", options);

  request.get(options, (err1, res1, body1) => {
    if (err1) {
      return console.log(err1);
    }

    let data = JSON.parse(res1.body);
    console.log("key-usage", data);
    res.send(data);
  });
});

app.get('/app-usage', (req, res) => {
  console.log("in get /app-usage");

  // curl --request GET 'https://admin.pubnub.com/api/v4/services/usage/legacy/usage?app_id=<key_id>&usageType=<usage_type>&file_format=json&start=<start_data>&end=<end_date>' \
  // --header 'X-Session-Token: <session_token>'

  const options = {
    'url': `https://admin.pubnub.com/api/v4/services/usage/legacy/usage?app_id=${req.query.appid}&usageType=transaction&file_format=json&start=${start_data}&end=${end_date}`,
    'headers': { 'X-Session-Token': req.query.token }
  };

  console.log(`app-usage options: ${JSON.stringify(options)}`);

  request.get(options, (err1, res1, body1) => {
    if (err1) {
      return console.log(err1);
    }

    let data = JSON.parse(res1.body);
    console.log("app-usage", data);
    res.send(data);
  });
});

app.get('/keys', (req, res) => {
  console.log("in get /keys");

  // curl 'https://internal-admin.pubnub.com/api/app/keys?app_id=1&page=1&limit=1'
  //  --header 'X-Session-Token: <token>'

  const options = {
    'url': `https://admin.pubnub.com/api/app/keys?app_id=${req.query.appid}&page=1&limit=99`,
    'headers': { 'X-Session-Token': req.query.token } 
  };

  console.log("keys options:", options);

  request.get(options, (err1, res1, body1) => {
    if (err1) {
      return console.log(err1);
    }

    let data = JSON.parse(body1).result;
    console.log("keys", data);
    res.send(data);
  });
});



app.get('/apps', (req, res) => {
  console.log("in get /apps");

  // curl --request GET 'https://admin.pubnub.com/api/apps?owner_id=<account_id>&no_keys=1' 
  // --header 'X-Session-Token: <session_token>'

  const options = {
    url: `https://admin.pubnub.com/api/apps?owner_id=${req.query.ownerid}&no_keys=1`,
    headers: { 'X-Session-Token': req.query.token }
  };

  console.log("apps options", options);

  request.get(options, (err1, res1, body1) => {
    console.log("in request.get apps");

    if (err1) {
      return console.log(err1);
    }

    let data = JSON.parse(res1.body);
    console.log("apps", data);
    res.send(data);
  });
});



// external customer login (no pn vpn required)
app.get('/login', (req, res) => {
  console.log("in /login");
  // curl --request POST 'https://admin.pubnub.com/api/me' \
  // --header 'Content-Type: application/json' \
  // --data-raw '{"email":"<email>","password":"<password>"}'

  // login //
  ///////////

  const options = {
    url: 'https://admin.pubnub.com/api/me',
    json: true,
    body: {
      email: req.query.username,
      password: req.query.password
    }
  };

  console.log("login options", options);

  request.post(options, (err, res1, body) => {
    console.log("login post response", JSON.stringify(res1));

    if (err) {
      return console.log(err);
    }

    // get accounts //
    //////////////////

    const options = {
      url: `https://admin.pubnub.com/api/accounts?user_id=${res1.body.result.user_id}`,
      headers: { 'X-Session-Token': res1.body.result.token },
      // json: true
    };

    console.log("account options", options);

    request.get(options, (err, res2, body2) => {
      // console.log("accounts get response", JSON.stringify(res2));
      if (err) {
        return console.log(err);
      }

      // respond to client with data //
      /////////////////////////////////
      let data = {
        "session": {
          "userid": res1.body.result.user_id,
          "token": res1.body.result.token,
          "accountid": res1.body.result.user.account_id
        }
      };

      data.accounts = JSON.parse(body2).result.accounts;
      console.log("accounts", data.accounts);

      ////////////////
      // const options = {
      //   url: `https://admin.pubnub.com/api/apps?owner_id=${data.accounts[0].id}&no_keys=1`,
      //   headers: { 'X-Session-Token': res1.body.result.token }
      //   // json: true
      // };
    
      // console.log("apps options:", options);
    
      // request.get(options, (err2, res2, body2) => {
      //   console.log("apps res body", body2);
    
      //   if (err2) {
      //     return console.log(err2);
      //   }
    
      //   let appsRes = JSON.parse(body2).result;
      //   console.log("apps result", appsRes);

      //   data.apps = appsRes.apps;
      ////////////////

        res.send(data);
      // });
    });
  });
});

