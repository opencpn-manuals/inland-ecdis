'use strict'

const fs = require('fs')
const git = requireGit()


function requireGit() {
  return require(require.resolve("isomorphic-git", {
    paths: [
      require.resolve("@antora/content-aggregator", { paths: module.paths }) +
        "/..",
    ],
  }));
}

