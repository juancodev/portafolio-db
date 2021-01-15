'use strict'

const utils = {
  extractTags
}

function extractTags (text) {
//  SE CREA UNA CONDICION QUE NOS INDIQUE SI EL TEXTO ES NULO
  if (text == null) {
    return []
  }
// SE CREA UNA VARIABLE MATCHES QUE SE LE ASIGNE EL VALOR DE 'text' . Y SE SELECCIONA LA FUNCION 'match', QUE NOS PERMITE ENTENDER EXPRESIONES REGULARES PASANDOLE COMO COMANDO
  const matches = text.match(/#(\w+)/g)

//  SI HACE MATCH  Y NO ENCUENTRA NINGUN VALOR, SE PASARA VACIO
  if (matches === null) {
    return []
  }

  return []
}

//  CREAMOS UNA FUNCION EN DONDE SE PUEDA NORMA

module.exports = utils


