'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const Db = require('../index.js')

const dbName = `portfolio-digital_${uuid.v4()}`
const db = new Db({db: dbName})