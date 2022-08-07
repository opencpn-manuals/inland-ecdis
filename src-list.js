"use strict";

const fs = require("fs");
const git = requireGit();
const http = requireHttp();

function requireGit() {
  return require(require.resolve("isomorphic-git", {
    paths: [
      require.resolve("@antora/content-aggregator", { paths: module.paths }) +
        "/..",
    ],
  }));
}
