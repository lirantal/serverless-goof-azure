"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require("../config");

const MongoURL = config.db.url;

module.exports = function(context, req) {
  context.log("GetTodos function invoked");

  MongoClient.connect(
    MongoURL,
    {
      auth: {
        user: config.db.username,
        password: config.db.password
      }
    },
    function(error, conn) {
      if (error) {
        context.log("error connecting to database");
        context.log(error);

        context.res = {
          status: 500,
          body: {
            error: JSON.stringify(error.message),
            trace: JSON.stringify(error.stack)
          }
        };
        return context.done();
      }

      context.log("Connected successfully to server");

      const itemId = context.req.params["id"];

      const db = conn.db("todos");
      const coll = db.collection("todos");
      coll.findOne({ id: itemId }, function(error, data) {
        if (error) {
          context.log("error getting todo item");
          context.log(error.message);

          context.res = {
            status: 500,
            body: {
              error: JSON.stringify(error.message),
              trace: JSON.stringify(error.stack)
            }
          };
          return context.done();
        } else {
          context.res = {
            status: 200,
            body: data
          };
          return context.done();
        }
      });
    }
  );
};
