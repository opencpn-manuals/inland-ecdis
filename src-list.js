'use strict'

const fs = require('fs')
//const git = requireGit
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
      this.logger.info('Here')
      const referenceFilePath = nav ? nav[0] :  'en/modules/ROOT/pages/index.adoc'
      if (name === targetName && version === targetVersion) targetFiles = files
      let referenceFile = files.find(({ path }) => path === referenceFilePath)
      referenceFile = referenceFile ? referenceFile : files[0]
      //this.logger.info(referenceFilePath)      
      const { gitdir, refhash } = referenceFile.src.origin
      if (gitdir) {
		const commits = await git.log({ fs, gitdir, depth: 1, ref: refhash })
        const lastCommit = commits[0]['commit']
        //this.logger.info(lastCommit)
        const lastHash = commits[0]['oid']
        const lastCommitSummary = {
          name: `${version ? version + '@' : ''}${name}`,
          commit: lastHash.substr(0, 7),
          subject: lastCommit.message.split(/$/m)[0],
          date: new Date(lastCommit.author.timestamp * 1000),
        }
        this.logger.info('name')
        this.logger.info(lastCommitSummary.name)
        this.logger.info(lastCommitSummary.commit)
        
        componentVersionData.lastCommitSummary = lastCommitSummary		
      }
    }
    if (targetFiles) {
	  this.logger.info('Here in targetFiles')
      const rows = contentAggregate.map((
        {lastCommitSummary: { name, commit, subject, date }}
      ) => `| ${name} | ${commit} | ${date_str(date)}| ${subject}`).join('\n')
      const now = date_str(new Date())
      
      this.logger.info(rows)
      //this.logger.info(lastCommitSummary.commit)
      
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
      
      //this.logger.info(contents)
      
      targetFiles.push({
        path: 'en/modules/ROOT/pages/sources.adoc',
        contents,
        src: {
          path: 'en/modules/ROOT/pages/sources.adoc',
          basename: 'sources.adoc',
          stem: 'sources',
          extname: '.adoc',
         }
      })
    }
  }
}

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
  
function date_str(date) {
  const year = '20' + ('' + date.getUTCFullYear()).slice(-2)
  const month = ('0' + date.getUTCMonth()).slice(-2)
  const day = ('0' + date.getUTCDay()).slice(-2)
  const hour = ('0' + date.getUTCHours()).slice(-2)
  const minute  =  ('0' + date.getUTCMinutes()).slice(-2)
  return `${year}-${month}-${day} ${hour}:${minute}`
}
  
module.exports = SourceListExtension
  
