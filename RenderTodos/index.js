"use strict";

const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");
const path = require("path");
const os = require("os");
const qs = require("qs");
const dust = require("dustjs-helpers");

const config = require("../config");

const MongoURL = config.db.url;

module.exports = function(context, req) {
  context.log("Render Todos function invoked");

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

      const db = conn.db("todos");
      const coll = db.collection("todos");
      coll.find().toArray(function(error, resultListTodos) {
        if (error) {
          context.log("error rendering todo items");
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
          //   data.forEach(value => context.log(value));

          context.log("Saving list to file");
          // For no good reason, write results to a temp files
          fs.writeFileSync(
            path.join(os.tmpdir(), `goof-todos-render.${Math.random()}`),
            JSON.stringify(resultListTodos)
          );

          context.log("Compiling render file");

          const templateFile = "render.dust";
          const templateFilePath = path.join(__dirname, templateFile);
          context.log(`templateFile: ${templateFilePath}`);

          fs.readFile(templateFilePath, function(err, data) {
            if (err) {
              context.log("error reading dust render file");
              context.log(err);

              context.res = {
                status: 500,
                body: {
                  error: JSON.stringify(err.message),
                  trace: JSON.stringify(err.stack)
                }
              };
              return context.done();
            } else {
              // Interpret the EJS template server side to produce HTML content
              context.log("data:" + JSON.stringify(resultListTodos));
              // Prepare the dust template (really should be stored ahead of time...)
              var compiled = dust.compile(data.toString(), "dustTemplate");
              dust.loadSource(compiled);

              // Parse the query string
              var params = qs.parse(context.req.query);
              context.log("Parsed parameters: " + JSON.stringify(params));
              // Invoke the template
              dust.render(
                "dustTemplate",
                {
                  title: "Goof TODO",
                  subhead: "Vulnerabilities at their best",
                  device: params.device,
                  todos: resultListTodos
                },
                function(err, html) {
                  if (err) {
                    context.log("error reading dust render file");
                    context.log(err);

                    context.res = {
                      status: 500,
                      body: {
                        error: JSON.stringify(err.message),
                        trace: JSON.stringify(err.stack)
                      }
                    };
                  } else {
                    // Return the HTML response
                    context.res = {
                      status: 200,
                      headers: {
                        "content-type": "text/html"
                      },
                      body: html
                    };
                    return context.done();
                  }
                }
              );
            }
          });
        }
      });
    }
  );
};
