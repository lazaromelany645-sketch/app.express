const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

//Configuración cookies
const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
}

//exports.metodo = async (petición, respuesta) => {}

exports.login = async (req, res) => {
    //Validación
    requireFields(req.body, ['nombre_usuario', 'clave_acceso'])

    //Deserealización
    const { nombre_usuario, clave_acceso } = req.body

    //Validar el tipo de dato (seguridad XSS)
    if (typeof nombre_usuario !== 'string' || typeof clave_acceso !== 'string'){
        throw httpError(400, 'Datos no son correctos')
    }

   //Buscamos al usuario con el nombre...
    const user = await db('usuarios').where({ nombre_usuario }).first()
    //Evaluamos si la clave es correcta...
    const valid = await bcrypt.compare(clave_acceso, user ? user.clave_acceso : DUMMY_HASH)

    //Sino existe el usuario OR si existe pero su estado (false) OR si la clave es incorrecta
    if (!user || !user.estado || !valid){
    //401 NO AUTORIZADO
    throw httpError(401, 'Usuario o contraseña incorrecto')
    }

      //Si llegaste hasta aquí - WELCOME
      //Habilitamos un permiso JWT
      const token = jwt.sign({
          id: user.id,
          nombre_usuario: user.nombre_usuario,
          nivel_acceso: user.nivel_acceso
      }, process.env.JWT_SECRET, {
          algorithm: 'HS256',
          expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      })

      res.cookie('token', token, cookieOpts).json({ message: 'Bienvenido' })
      }

     //Cierre de sesión (destruye LOGIN)
        exports.logout = async (req, res) => {
        res.clearCookie('token', cookieOpts).json({ message: 'Sesión finalizada' })
        }

      //Función que retorne la información completa del usuario
      //usuario > persona
      exports.me = async (req, res) => {
         //Objetivo es hacer una consulta multitable para obtener los datos del usuario
        const usuario = await db('usuarios as u')
        .join('personas as p', 'p.id', 'u.idpersona')
        .where('u.id', req.user.id)
        .first()

        if (!usuario) {
            throw httpError(404, 'Usuario no encontrado')
        }

        res.json(usuario)
        }