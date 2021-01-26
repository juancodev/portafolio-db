//  Prueba para utilizar los test de la subida de imagen y base de datos
'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const utils = require('../lib/utils')
const fixtures = require('./fixtures')

// debemos configurar la base de datos cada vez que la vayamos a modificar como prueba y necesitamos esperar a conectarnos.
test.beforeEach('configuracion database', async t => {
  //  nos permite generar una base de datos de prueba con el nombre de portafolio pero con id diferentes
  const dbName = `portfolio-digital_${uuid.v4()}`
  //  instanciamos la clase pasándole como objeto la options del nombre de la base de datos
  const db = new Db({ db: dbName })
  await db.connect()
  //  después de la conexión se aplica un contexto que es simplemente una pieza de código que se puede aplicar antes de cada test
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'conectado a la base de datos')
})

test.afterEach.always('limpieza de las db', async t => {
  const db = t.context.db
  const dbName = t.context.dbName

  await db.disconnect()
  t.false(db.connected, 'desconectado database')
  //  después de desconectarnos de la base de datos, hacemos la limpieza de las tablas
  const conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

//  creamos el test para guarda imágenes
test('guardar imagen', async t => {
  //  debemos pasarle el contexto de la base de datos, ya que no esta de forma global
  const db = t.context.db

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
  //  debemos pasarle el contexto de la base de datos, ya que no esta de forma global
  const db = t.context.db

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
  //  debemos pasarle el contexto de la base de datos, ya que no esta de forma global
  const db = t.context.db

  //  nos garantizamos de que la función exista dentro de la clase
  t.is(typeof db.getImage, 'function', 'debe ser una funcion')
  const image = fixtures.getImage()
  const created = await db.saveImage(image)
  const result = await db.getImage(created.public_id)
  t.deepEqual(created, result)
})

test('lista todas las imagen', async t => {
  //  debemos pasarle el contexto de la base de datos, ya que no esta de forma global
  const db = t.context.db

  //  requerimos el método getImage en donde se encuentran todas las imagenes
  const images = fixtures.getImages(3)
  //  realizamos una función en donde guarde todas las imagenes
  const saveImages = images.map(img => db.saveImage(img))
  //  y veremos el resultado después de ejecutar 'Promise.all' de saveImage
  const created = await Promise.all(saveImages)
  const result = await db.getImages()

  //  después comparamos si la longitud de las imagenes que creamos es igual a la longitud  del resultado
  t.is(created.length, result.length)
})

test('Guardar usuario', async t => {
  const db = t.context.db

  t.is(typeof db.saveUser, 'function', 'debe ser una funcion')

  const user = fixtures.getUser()
  //  dejamos una referencia de la encriptacion de la password
  const plainPassword = user.password
  const created = await db.saveUser(user)

  //  hacemos las comparaciones
  t.is(user.username, created.username)
  t.is(user.email, created.email)
  t.is(user.name, created.name)
  t.is(utils.encrypt(plainPassword), created.password)
  //  garantizamos de que venga con un id
  t.is(typeof created.id, 'string')
  // truthy significa que por lo menos haya algún valor
  t.truthy(created.createdAt)
})
