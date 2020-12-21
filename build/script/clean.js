'use strict'

process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const del = require('del')
const doneLog = chalk.bgGreen.white(' DONE ') + ' '

if (process.env.BUILD_TARGET === 'clean') clean()

function clean () {
    del.sync(['dist/electron/*', '!dist/electron/icons', '!dist/electron/script', '!dist/electron/bin', '!dist/electron/lib'])
    console.log(`\n${doneLog}\n`)
    process.exit()
}
