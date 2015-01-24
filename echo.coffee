fs = require 'fs'

exports.echo = (file,data) ->
    fs.appendFile file, String(data) + "\n"
    
exports.clearEcho = (file,data) ->
    fs.writeFileSync file, data

exports.wrapEcho = (file) -> (data) -> exports.echo(file,data)

exports.wrapClearEcho = (file) -> (data) -> exports.clearEcho(file,data)