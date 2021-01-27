'use strict'

const co = require('co')
const r = require('rethinkdb')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const utils = require('./utils')

//  crearemos una clase con el nombre Db para nuestra conexion. Mientras que requerimos el modulo 'RethinkDb'
//  en el siguiente caso, no quedará el valor dentro del método connect de rethinkdb para poder ser cambiados a lo largo del código en diferentes servidores.
const defaults = {
  host: 'localhost',
  port: 28015,
  db: 'portafolio_digital'
}

//  por ahora creamos el constructor con parametro 'options' que sera options igual al mismo parametro que reciba o si no recibe ninguno sera un objeto vacio, la siguiente linea es el host, port, db seran suya propia de options o sino las que traeremos por defecto
class Db {
  constructor (options) {
    options = options || {}
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
    this.connected = false
  }

  //  objeto de conexion (revisar, error de conexión)
  connect (callback) {
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })

    //  le asignamos la propiedad en el método de la conexión
    this.connected = true

    //  primero para conectarnos a la base de datos y necesitamos hacer referencia a la conexion y tambien el nombre de la base de datos
    const db = this.db
    const connection = this.connection

    const setup = co.wrap(function * () {
      const conn = yield connection

      // luego de estar conectado necesito tener la lista de bases de datos que tengo para eso creamos una variable 'dbList' que espera a que se resuelva la promesa 'r.dbList (es para listar las db que tengo)' . 'llamamos al metodo run pasandole como parametro la conexion' y el run es lo mismo que si fuera en la parte visual del dataexplore y es necesario utilizarlo cuando utilicemos rethinkdb dentro de nodejs
      const dbList = yield r.dbList().run(conn)
      if (dbList.indexOf(db) === -1) {
        //  para crear la base de datos, necesitamos el metodo 'dbCreate' que vemos en el dataexplorer y le pasamos el nombre de la base de datos como parametro y la referencia a la conexion (run(conn))
        yield r.dbCreate(db).run(conn)
      }

      //  realizaremos el mismo paso pero ahora con las tablas, necesitamos buscar la base de datos con el nombre creado y luego listar las tablas de esa db y conectarnos. Adicionalmente, se crea un 'indexCreate' para hacer las consultas un poco más eficientes
      const dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('images') === -1) {
        yield r.db(db).tableCreate('images').run(conn)
        yield r.db(db).table('images').indexCreate('createdAt').run(conn)
      }

      //  y exactamente lo mismo para la tabla de usuarios
      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users').run(conn)
        yield r.db(db).table('users').indexCreate('username').run(conn)
      }

      //  y cuando se cumpla la promesa setup vamos a retornar la referencia de la conexion a la base de dato
      return conn
    })

    //  esta sola linea indica que si no le pasan callback retorno la promesa resuelta de lo contrario manejo todo lo anterior como una funcion asincrona con caconst
    return Promise.resolve(setup()).asCallback(callback)
  }

  //  creamos un método llamado 'disconnect' que recibe un argumento (callback) y me una condición que indica si la conexión no esta realizada, me retorne una nueva promesa con el error
  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('No se ha conectado')).asCallback(callback)
    }
    this.connected = false
    return Promise.resolve(this.connection).then((conn) => conn.close())
  }

  //  e implementamos la misma lógica de conexión para indicar si estoy conectado y así comprobamos que cada vez que subamos una imagen, nos garantizamos que estamos conectados
  saveImage (image, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection
      image.createdAt = new Date()
      //  Después de crear una propiedad de las imagenes como la fecha, crearemos otra propiedad para extraer de la descripción los tags
      image.tags = utils.extractTags(image.description)
      //  Y almacenamos el resultado de la anteriores asignaciones a una constante después que se haya cumplido la promesa
      const result = yield r.db(db).table('images').insert(image).run(conn)

      //  Y creamos una condición para comprobar si esto funciona
      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      //  En esta línea obtenemos el id de la imagen que me genera con el valor con la posición 0 'generated_keys[0]'
      image.id = result.generated_keys[0]

      //  Después creamos una corutina o promesa que se cumpla para obtener el id de la imagen antes de que sea insertada en nuestra db
      yield r.db(db).table('images').get(image.id).update({
        //  Con el método update podemos pasar una propiedad y también cambiar la propiedad
        public_id: uuid.encode(image.id)
      }).run(conn)

      //  En este caso crearemos una constante que obtenga la promesa resuelta del id que va a obtener
      const created = yield r.db(db).table('images').get(image.id).run(conn)

      //  En este caso, no vamos a la promesa resuelta del objeto image sino de la variable created
      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  likeImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db
    const imageId = uuid.decode(id)

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection
      const image = yield r.db(db).table('images').get(imageId).run(conn)
      yield r.db(db).table('images').get(imageId).update({
        liked: true,
        likes: image.likes + 1
      }).run(conn)

      const created = yield r.db(db).table('images').get(imageId).run(conn)
      return Promise.resolve(created)
    })

    //  De esta forma es la implementación de las imagenes a nuestra base de dato
    return Promise.resolve(tasks()).asCallback(callback)
  }

  getImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db
    const imageId = uuid.decode(id)

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection
      const image = yield r.db(db).table('images').get(imageId).run(conn)
      return Promise.resolve(image)
    })
    //  Resolvemos todas las tareas con el callback async
    return Promise.resolve(tasks()).asCallback(callback)
  }

  //  Creamos el metodo getImages y este no recibe parámetros
  getImages (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection

      //  de esta forma creamos un query de poder listar las imagenes por fecha de forma descendiente
      const images = yield r.db(db).table('images').orderBy({
        index: r.desc('createdAt')
      }).run(conn)

      const result = yield images.toArray()

      return Promise.resolve(result)
    })
    //  Resolvemos todas las tareas con el callback async
    return Promise.resolve(tasks()).asCallback(callback)
  }

  saveUser (user, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection
      user.password = utils.encrypt(user.password)
      user.createdAt = new Date()

      const result = yield r.db(db).table('users').insert(user).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      user.id = result.generated_keys[0]

      const created = yield r.db(db).table('users').get(user.id).run(conn)

      return Promise.resolve(created)
    })
    //  Resolvemos todas las tareas con el callback async
    return Promise.resolve(tasks()).asCallback(callback)
  }

  getUser (username, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('no se ha conectado')).asCallback(callback)
    }
    //  Primero necesitamos tener una referencia de nuestra conexión, ya que vamos a obtener una corutina y le pasamos el nombre de la base de datos
    const connection = this.connection
    const db = this.db

    //  Y le pasamos una corutina de tareas para que se realicen de forma async
    const tasks = co.wrap(function * () {
      const conn = yield connection
      yield r.db(db).table('users').indexWait().run(conn)
      const users = yield r.db(db).table('users').getAll(username, {
        //  esto es como si fuera un where
        index: 'username'
      }).run(conn)

      const result = yield users.next()

      return Promise.resolve(result)
    })
    //  Resolvemos todas las tareas con el callback async
    return Promise.resolve(tasks()).asCallback(callback)
  }
}

module.exports = Db
