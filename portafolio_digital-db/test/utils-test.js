//  SE COMIENZA A TRABAJAR CON EL 'use strict' para poder utilizar todos los features de ECMAScript 6
'use strict'

const test = require('ava')
const utils = require('../lib/utils')

//  EN ESTE CASO, UTILIZAMO EL METODO TEST QUE REQUERIMOS DE 'AVA' Y UTILIZAMOS EL TÍTULO COMO PRIMER PARAMENTRO Y SEGUNDO PARAMETRO UN CALLBACK Y ESTA VEZ CREAMOS UNA VARIABLE 'tags' ASIGNANDOLE LA 'utils' . Y SU PROPIEDAD 'extractTags', PARA EXTRAER TODOS LOS HASHTAGS DE MI APLICACION CON REGLAS PARA QUE ME LOS TRAIGA EN MINUSCULAS.
test('extrayendo los hashtags del proyecto', t => {
  let tags = utils.extractTags('un #picture con tags #TeSt #Portafolio ##aVa')
  t.deepEqual(tags, [
    'picture',
    'test',
    'portafolio',
    'ava'
  ])
  //  SI NO ME DEVUELVE NINGUN TAGS, QUE SE DEVUELVA UN ARRAY VACIO
  tags = utils.extractTags('cuando no encuentra ningun tag')
  t.deepEqual(tags, [])

  //  SI NO SE ENVIAN PARAMETROS A LA FUNCION 'extractTags'
  tags = utils.extractTags()
  t.deepEqual(tags, [])

  tags = utils.extractTags(null)
  t.deepEqual(tags, [])
})

test('encriptar contraseñas', t => {
  //  indicamos que tenemos una contraseña
  const password = 'helloword123'
  const encrypted = 'ebf6a3f93672bd946e1ce8a7d6b75d6f35232b5f8e713a5aa9e103a4f053737b'

  const result = utils.encrypt(password)
  t.is(result, encrypted)
})

//  'deepEqual', ES UNA PROPIEDAD QUE VA A EVALUAR SI EL VALOR ES IGUAL AL ESPERADO, LA CANTIDAD ES IGUAL, ETC.

//  ARCHIVOS DE PRUEBA
//  VEREMOS CÓMO UTILIZAR TEST Y EL PRIMER PARÁMETRO ES SOLICITAR UN TITULO, COMO SEGUNDO PARÁMETRO, RECIBO UN CALLBACK QUE ME PERMITE RECIBIR LAS ASSERTIONS Y ME PERMITE VER EL RESULTADO DE ALGO EJECUTADO SEA EL ESPERADO
//  test('este va a pasar', t => {
//  t.pass()
//  })

//  EN ESTE CASO ES UNA PRUEBA PARA VALIDAR Y VER QUE PASA SI FALLA UN TEST
//  test('en este caso fallaria', t => {
//  t.fail()
//  })

//  EN ESTE CASO, SE MUESTRA QUE PASARIA SI SE CREA UNA FUNCION ASYNC/AWAIT, SE NECESITA CREAR UNA VARIABLE QUE SE LE ASIGNE UNA PROMESA LE INDICAMOS QUE RESUELVA EL VALOR 42, ESO SIGNIFICA QUE ES UNA PROMESA CUALQUIERA, CREAMOS UNA VARIABLE 'secret' QUE RESUELVE ESA PROMESA*/
//  test('se muestra como soporta funciones async/await', async t => {
//  const p = Promise.resolve(42)
//  const secret = await p
//  t.is(secret, 42)
//  })
