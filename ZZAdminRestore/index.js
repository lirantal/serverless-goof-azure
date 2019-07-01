"use strict";

module.exports = function(context, req) {
  context.log("Performing restore");

  context.res = {
    status: 200,
    body: "Restore complete"
  };

  return context.done();
};
