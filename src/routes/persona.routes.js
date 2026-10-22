const router = require('express').Router()
const c = require('../controllers/persona.controller')

//RECUERDA:
//Las rutas requieren las funcionalidades en los controladores

//router.verbo('/ruta', controlador.accion)

router.get('/') //listar
router.get('/:id') //buscar
router.post('/') //registrar
router.put('/:id') //modificar
router.delete('/:id') //eliminar

module.exports = router