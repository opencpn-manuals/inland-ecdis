'use strict'

const fs = require('fs')
const git = require('isomorphic-git', {
      paths: [
        require.resolve('@antora/content-aggregator', { paths: module.paths })
        + '/..'
      ]
    })

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
    
      require('@antora/content-aggregator', { paths: module.paths })
       
  }
    async onContentAggregated ({contentAggregate}) {
    this.logger.info('Building sources appendix')
    let targetFiles
    const { targetName = 'manuals', targetVersion = 'en' } = this.config
    for (const componentVersionData of contentAggregate) {
      const { name, version, files, nav } = componentVersionData
      const referenceFilePath = nav ? nav[0] :  'en/modules/ROOT/pages/index.adoc'
      if (name === targetName && version === targetVersion) targetFiles = files
      let referenceFile = files.find(({ path }) => path === referenceFilePath)
      referenceFile = referenceFile ? referenceFile : files[0]
      const { gitdir, refhash } = referenceFile.src.origin
      if (gitdir) {
		const commits = await git.log({ fs, gitdir, depth: 1, ref: refhash })
        const lastCommit = commits[0]['commit']
        const lastHash = commits[0]['oid']
        const lastCommitSummary = {
          name: `${version ? version + '@' : ''}${name}`,
          commit: lastHash.substr(0, 7),
          subject: lastCommit.message.split(/$/m)[0],
          date: new Date(lastCommit.author.timestamp * 1000),
        }
        componentVersionData.lastCommitSummary = lastCommitSummary		
      }
    }
    if (targetFiles) {
      const rows = contentAggregate.map((
        {lastCommitSummary: { name, commit, date, subject}}
      ) => `| ${name} | ${commit} | ${date_str(date)} | ${subject}`).join('\n')
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

function pad(n) {
    return n<10 ? '0'+n : n;
}
  
function date_str(date) {
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getUTCHours())
  const minute  = pad(date.getUTCMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}
  
module.exports = SourceListExtension
  
