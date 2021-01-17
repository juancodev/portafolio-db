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
  let matches = text.match(/#(\w+)/g)

  //  SI HACE MATCH  Y NO ENCUENTRA NINGUN VALOR, SE PASARA VACIO
  if (matches === null) {
    return []
  }

  //  UTILIZAMOS LA PROGRAMACION FUNCIONAL CON LA FUNCION 'map' PARA QUE VAYA INTERANDO CON CADA UNA DE LOS MATCHES Y LE ASIGNE LO QUE CONTIENE LA FUNCION NORMALIZE
  matches = matches.map(normalize)

  return matches
}

//  CREAMOS UNA FUNCION EN DONDE SE PUEDA NORMALIZAR
function normalize (text) {
  text = text.toLowerCase()
  text = text.replace(/#/g, '')
  return text
}

module.exports = utils
