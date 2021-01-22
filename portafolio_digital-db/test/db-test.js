//  Prueba para utilizar los test de la subida de imagen y base de datos
'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')

//  nos permite generar una base de datos de prueba con el nombre de portafolio pero con id diferentes
const dbName = `portfolio-digital_${uuid.v4()}`

//  instanciamos la clase pasándole como objeto la options del nombre de la base de datos
const db = new Db({ db: dbName })

// debemos configurar la base de datos cada vez que la vayamos a modificar como prueba y necesitamos esperar a conectarnos.
test.before('configuracion database', async t => {
  await db.connect()
  t.true(db.connected, 'conectado a la base de datos')
})

test.after('desconectarme database', async t => {
  await db.disconnect()
  t.false(db.connected, 'desconectado database')
})

test.after.always('limpiar la base de datos', async t => {
  const conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

//  creamos el test para guarda imágenes
test('guardar imagen', async t => {
  //  vamos a garantizar que la clase tenga la funcion 'saveImage' guardar imagen. 'is' me permite hacer una comparación de que lo que está en el primer valor sea igual al segundo (derecha)
  t.is(typeof db.saveImage, 'function', 'guardando imagen...')
})
