//  Prueba para utilizar los test de la subida de imagen y base de datos
'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const fixtures = require('./fixtures')

//  nos permite generar una base de datos de prueba con el nombre de portafolio pero con id diferentes
const dbName = `portfolio-digital_${uuid.v4()}`
const db = new Db({ db: dbName })

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

  //  creamos la siguiente imagen fixeture como una imagen de prueba
  const image = fixtures.getImage()
  //  crearemos una variable que va a contener lo que me devuelva la promesa del método db.saveImage(image) y compararlo que sea exactamente a lo que estamos esperando recibir
  const created = await db.saveImage(image)
  t.is(created.description, image.description)
  t.is(created.url, image.url)
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.deepEqual(created.tags, ['increible', 'tags', 'portafolio_digital'])
  t.is(created.user_id, image.user_id)
  t.is(typeof created.id, 'string')
  t.is(created.public_id, uuid.encode(created.id))
  t.truthy(created.createdAt)
})

//  En este caso, creamos el test para probar si la imagen recibe o no like
test('comprobar likes', async t => {
  t.is(typeof db.likeImage, 'function', 'debe ser una funcion')

  //  volvemos a requerir fixtures
  const image = fixtures.getImage()
  //  esperamos a que se conecte con la db y el campo saveImage
  const created = await db.saveImage(image)
  //  esperamos el resultado que devuelve el id_publico
  const result = await db.likeImage(created.public_id)
  //  garantizamos que la imagen va a venir con like
  t.true(result.liked)
  //  y comprobamos que los likes de la imagen se sume dependiendo del que tiene
  t.is(result.likes, image.likes + 1)
})

//  metodo para obtener id de la imagen
test('obtener id de la imagen', async t => {
  //  nos garantizamos de que la función exista dentro de la clase
  t.is(typeof db.getImage, 'function', 'debe ser una funcion')
  const image = fixtures.getImage()
  const created = await db.saveImage(image)
  const result = await db.getImage(created.public_id)
  t.deepEqual(created, result)
})

