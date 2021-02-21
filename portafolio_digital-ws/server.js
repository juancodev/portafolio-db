'use strict'

const http = require('http')
const socketio = require('socket.io')
const r = require('rethinkdb')
const config = require('./config')

const server = http.createServer()
const io = socketio(server)
const port = process.env.PORT || 5151

//  para utilizar el change fix (cambios a tiempo real) debemos conectarnos primero.
r.connect(config.db, (err, conn) => {
  if (err) return console.error(err.message)

  //  al conectarnos por defecto estamos a la base de datos portafolio_digital y con el método changes vemos los cambios de las tablas
  r.table('images').changes().run(conn, (err, cursor) => {
    if (err) return console.error(err.message)

    //  data siempre va a emitirse cada vez que haya un cambio en la base de datos, en este caso en la tabla de imágenes
    cursor.on('data', data => {
      const image = data.new_val

      if (image.publicId != null) {
        io.sockets.emit('image', image)
      }
    })
  })
})

server.listen(port, () => console.log(`Escuchando en el puerto ${port}`))
