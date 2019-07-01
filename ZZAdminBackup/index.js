"use strict";

module.exports = function(context, req) {
  context.log("Performing backup");

  context.res = {
    status: 200,
    body: "Backup complete"
  };

  return context.done();
};
