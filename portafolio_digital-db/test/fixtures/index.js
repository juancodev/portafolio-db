'use strict'

const uuid = require('uuid-base62')

//  Creamos una nueva carpeta que contiene los fixture que son parte de código básico para hacer pruebas, dentro creamos un objeto llamado 'fixture' que dentro tendrá un método llamado 'getImage' que retorna un objeto
const fixtures = {
  getImage () {
    return {
      description: '#increible imagenes con su #tags #portafolio_digital',
      url: `https//portafoliodigital.test/${uuid.v4()}.jpg`,
      likes: 0,
      liked: false,
      user_id: uuid.uuid()
    }
  }
}

module.exports = fixtures
