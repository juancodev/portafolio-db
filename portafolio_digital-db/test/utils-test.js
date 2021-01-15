//  SE COMIENZA A TRABAJAR CON EL 'use strict' para poder utilizar todos los features de ECMAScript 6
'use strict'

const test = require('ava')

/*  VEREMOS CÓMO UTILIZAR TEST Y EL PRIMER PARÁMETRO ES SOLICITAR UN TITULO, COMO SEGUNDO PARÁMETRO, RECIBO UN CALLBACK QUE ME PERMITE RECIBIR LAS ASSERTIONS Y ME PERMITE VER EL RESULTADO DE ALGO EJECUTADO SEA EL ESPERADO */
test('este va a pasar', t => {
  t.pass()
})

//  EN ESTE CASO ES UNA PRUEBA PARA VALIDAR Y VER QUE PASA SI FALLA UN TEST
test('en este caso fallaria', t => {
  t.fail()
})

/*  EN ESTE CASO, SE MUESTRA QUE PASARIA SI SE CREA UNA FUNCION ASYNC/AWAIT, SE NECESITA CREAR UNA VARIABLE QUE SE LE ASIGNE UNA PROMESA LE INDICAMOS QUE RESUELVA EL VALOR 42, ESO SIGNIFICA QUE ES UNA PROMESA CUALQUIERA, CREAMOS UNA VARIABLE 'secret' QUE RESUELVE ESA PROMESA  */
test('se muestra como soporta funciones async/await', async t => {
  const p = Promise.resolve(42)
  const secret = await p
  t.is(secret, 42)
})
