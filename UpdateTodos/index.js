"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require("../config");

const MongoURL = config.db.url;

module.exports = function(context, req) {
  context.log("UpdateTodos function invoked");

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

      const timestamp = new Date().getTime();
      const data = context.req.body;

      // validation
      if (typeof data.text !== "string" || typeof data.checked !== "boolean") {
        context.log("Validation Failed");
        const errorValidation = new Error("Couldn't update the todo item.");
        context.res = {
          status: 500,
          body: {
            error: JSON.stringify(errorValidation.message),
            trace: JSON.stringify(errorValidation.stack)
          }
        };
        return context.done();
      }

      const itemId = context.req.params["id"];

      const record = {
        text: data.text,
        checked: data.checked,
        updatedAt: timestamp
      };

      const db = conn.db("todos");
      const coll = db.collection("todos");
      coll.findOneAndUpdate({ id: itemId }, { $set: record }, function(
        error,
        data
      ) {
        if (error) {
          context.log("error updating todo item");
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
            body: data.value
          };
          return context.done();
        }
      });
    }
  );
};
