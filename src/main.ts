import * as core from '@actions/core'
import {GitHub, context} from '@actions/github'
import parse from 'parse-diff'

async function run() {
  try {
    const token = core.getInput('github-token', {required: true})
    const github = new GitHub(token, {})
    const keyword = core.getInput('keyword')

    const url = context.payload.pull_request.url
    const result = await github.request(url, {
      headers: {
        Accept: 'application/vnd.github.v3.diff'
      }
    })
    const files = parse(result.data)
    core.exportVariable('files', files)
    core.setOutput('files', files)

    let changes = ''
    for (const file of files) {
      for (const chunk of file.chunks) {
        for (const change of chunk.changes) {
          if (change.type === 'add') {
            changes += change.content
          }
        }
      }
    }

    if (changes.indexOf(keyword) >= 0) {
      core.setFailed(`The code contains ${keyword}`)
    }
  } catch (error) {
    console.error( error.stack )
    console.error(error)
    core.setFailed(error.message)
  }
}

run()
