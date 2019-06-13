"use strict";

const uuid = require("uuid");
const hms = require("humanize-ms");
const ms = require("ms");
const fs = require("fs");

const MongoClient = require("mongodb").MongoClient;
const config = require("../config");

const MongoURL = `mongodb://${config.db.url}/${config.db.name}`;

module.exports = function(context, req) {
  context.log("CreateTodos function invoked");

  const timestamp = new Date().getTime();
  const data = req.body;
  if (typeof data.text !== "string") {
    context.log("Validation Failed");
    context.res = {
      status: 500,
      body: {
        error: JSON.stringify(message)
      }
    };
    return context.done();
  }

  const todoTxt = parse(data.text);

  const record = {
    id: uuid.v1(),
    text: todoTxt,
    checked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  context.log("preparing to save todo record:");
  context.log(record);

  MongoClient.connect(
    MongoURL,
    {
      user: encodeURIComponent(config.db.cosmosdbname),
      pass: encodeURIComponent(config.db.key),
      ssl: true,
      sslValidate: false
    },
    function(error, conn) {
      context.log("Connected successfully to server");

      if (error) {
        context.log("error creating todo item");
        context.log(error);

        context.res = {
          status: 500,
          body: {
            error: JSON.stringify(message)
          }
        };
        return context.done();
      }

      const db = conn.db("todos");
      const coll = db.collection("todos");
      coll.insertOne(record, function(error, result) {
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
      });
    }
  );
};

function parse(todo) {
  var t = todo;

  var remindToken = " in ";
  var reminder = t.toString().indexOf(remindToken);
  if (reminder > 0) {
    var time = t.slice(reminder + remindToken.length);
    time = time.replace(/\n$/, "");

    var period = hms(time);

    console.log("period: " + period);

    // remove it
    t = t.slice(0, reminder);
    if (typeof period != "undefined") {
      t += " [" + ms(period) + "]";
    }
  }
  return t;
}
