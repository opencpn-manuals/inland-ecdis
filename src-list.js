'use strict'

const fs = require('fs')
const git = requireGit


function requireGit () {
  return require(
    require.resolve('isomorphic-git', {
      paths: [
        require.resolve('@antora/content-aggregator', { paths: module.paths })
        + '/..'
      ]
    })
  )
}

class SourceListExtension {
  static register ({ config }) {
    new SourceListExtension(this, config)
  }

  constructor (generatorContext, config) {
    this.config = config
    ;(this.context = generatorContext)
      .on('contentAggregated', this.onContentAggregated.bind(this))
    this.logger =
      this.context.require('@antora/logger')('source-list-extension')
  }
  
    async onContentAggregated ({contentAggregate}) {
    this.logger.info('Building sources appendix')
    let targetFiles
    const { targetName = 'inland-ecdis-docs', targetVersion = '' } = this.config
    for (const componentVersionData of contentAggregate) {
      const { name, version, files, nav } = componentVersionData
      const referenceFilePath = nav ? nav[0] :  'modules/ROOT/pages/index.adoc'
      if (name === targetName && version === targetVersion) targetFiles = files
      let referenceFile = files.find(({ path }) => path === referenceFilePath)
      referenceFile = referenceFile ? referenceFile : files[0]
      const { gitdir, refhash } = referenceFile.src.origin
      
    }
    if (targetFiles) {
      const rows = contentAggregate.map((
        {lastCommitSummary: { name, commit, subject, date }}
      ) => `| ${name} | ${commit} | ${date_str(date)}| ${subject}`).join('\n')
      const now = date_str(new Date())
      const contents = Buffer.from(`
= Table of Manual Sources

Manual generated at ${now} UTC

[cols=3;1;3;7]
|====
| Name | Commit | Date | Subject

${rows}
|====
`.trim()
)
      targetFiles.push({
        path: 'modules/ROOT/pages/sources.adoc',
        contents,
        src: {
          path: 'modules/ROOT/pages/sources.adoc',
          basename: 'sources.adoc',
          stem: 'sources',
          extname: '.adoc',
         }
      })
    }
  }
}
  

  
module.exports = SourceListExtension
  
