'use strict'

const co = require('co')
const r = require('rethinkdb')
const Promise = require('bluebird')

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
    this.host = options || defaults.host
    this.port = options || defaults.port
    this.db = options || defaults.db
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

      //  realizaremos el mismo paso pero ahora con las tablas, necesitamos buscar la base de datos con el nombre creado y luego listar las tablas de esa db y conectarnos
      const dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('images') === -1) {
        yield r.db(db).tableCreate('images').run(conn)
      }

      //  y exactamente lo mismo para la tabla de usuarios
      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users').run(conn)
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

  saveImage (image, callback) {
  }
}

module.exports = Db
