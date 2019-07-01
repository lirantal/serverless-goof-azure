"use strict";
const qs = require("qs");
const https = require("https");

const config = require("../config");

const adminSecret = "ea29cbdb-a562-442a-8cc2-adbc6081d67c";

module.exports = function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const query = qs.parse(context.req.query);
  const params = context.req.params;

  if (!query || !query.secret || query.secret != adminSecret) {
    // Return an unauthorized response
    context.log("error accessing admin api item");
    context.log(error.message);

    context.res = {
      status: 401,
      body: {
        error: JSON.stringify(error.message),
        trace: JSON.stringify(error.stack)
      }
    };
    return context.done();
  }

  context.log("Admin secret key ok!");

  // Choose the action to perform
  const action = params.action;
  let remoteFunctionURL = "";
  switch (action) {
    case "backup":
      remoteFunctionURL = `${config.functions.backup.url}?code=${
        config.functions.backup.secret
      }`;
      break;
    case "restore":
      remoteFunctionURL = `${config.functions.restore.url}?code=${
        config.functions.restore.secret
      }`;
      break;
    default:
      break;
  }

  // Invoke it!
  context.log("invoking " + remoteFunctionURL);

  const request = https.get(remoteFunctionURL, res => {
    // TODO not doing anything with data yet
    let data = "";

    res.on("data", chunk => {
      data += chunk;
    });

    res.on("end", () => {
      context.log(`successfully invoked azure function: ${action}`);
      context.res = {
        status: 200,
        body: "API call complete"
      };
      return context.done();
    });
  });

  request.on("error", error => {
    context.log("error invoking azure function");
    context.log(error);

    context.res = {
      status: 500,
      body: {
        error: JSON.stringify(error.message),
        trace: JSON.stringify(error.stack)
      }
    };
    return context.done();
  });
};
