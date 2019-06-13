"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require("../config");

const MongoURL = `mongodb://${config.db.url}/${config.db.name}`;

module.exports = function(context, req) {
  context.log("ListTodos function invoked");

  MongoClient.connect(
    MongoURL,
    {
      user: config.db.cosmosdbname,
      pass: config.db.key,
      ssl: true,
      sslValidate: false,
      poolSize: 1
    },
    function(error, conn) {
      if (error) {
        context.log("error connecting to database");
        context.log(error);

        context.res = {
          status: 500,
          body: {
            error: JSON.stringify(message),
            trace: JSON.stringify(error.stack)
          }
        };
        return context.done();
      }

      context.log("Connected successfully to server");

      const db = conn.db("todos");
      const coll = db.collection("todos");
      coll.find().toArray(function(error, data) {
        if (error) {
          context.log("error listing todo item");
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
          data.forEach(value => context.log(value));

          context.res = {
            status: 200,
            body: data
          };

          db.close();
          return context.done();
        }
      });
    }
  );
};
