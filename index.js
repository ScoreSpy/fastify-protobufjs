'use strict'

const fp = require('fastify-plugin')
const protobufjs = require('protobufjs')

function fastifyProtobuf(fastify, options, next) {

    const { protoloadPath, messagePackage } = options
    const root = protobufjs.loadSync(protoloadPath)
    const Package = root.lookupType(messagePackage)

    fastify.register(require('@fastify/accepts-serializer'), {
        serializers: [
            {
                regex: /^application\/x-protobuf$/,
                serializer: body => Package.encode(Package.create(body)).finish()
            }
        ],
        default: 'application/json'
    })

    fastify.addContentTypeParser('application/x-protobuf', {
        parseAs: 'buffer'
    }, (req, body, done) => {
        try {
            const res = Package.decode(body)
            return res
        } catch (err) {
            done(err)
        }
    })

    next()
}


module.exports = fp(fastifyProtobuf, {
    fastify: '4.x',
    name: 'fastify-protobufjs'
})