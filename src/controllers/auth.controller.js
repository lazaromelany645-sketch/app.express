const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

// Hash falso: se compara igual aunque el usuario no exista (evita ataques de tiempo)
const DUMMY_HASH = bcrypt.hashSync('clave-falsa-para-igualar-tiempos', 10)

// Configuración cookies
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}

exports.login = async (req, res) => {
  requireFields(req.body, ['nombre_usuario', 'clave_acceso'])
  const { nombre_usuario, clave_acceso } = req.body

  if (typeof nombre_usuario !== 'string' || typeof clave_acceso !== 'string')
    throw httpError(400, 'Datos no son correctos')

  const user = await db('usuarios').where({ nombre_usuario }).first()
  const valid = await bcrypt.compare(clave_acceso, user ? user.clave_acceso : DUMMY_HASH)

  if (!user || !user.estado || !valid)
    throw httpError(401, 'Usuario o contraseña incorrecto')

  const token = jwt.sign(
    { id: user.id, nombre_usuario: user.nombre_usuario, nivel_acceso: user.nivel_acceso },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )

  res.cookie('token', token, cookieOpts).json({ message: 'Bienvenido' })
}

// Cierre de sesión
exports.logout = async (req, res) => {
  res.clearCookie('token', cookieOpts).json({ message: 'Sesión finalizada' })
}

// Datos del usuario autenticado (sin la clave)
exports.me = async (req, res) => {
  const usuario = await db('usuarios as u')
    .join('personas as p', 'p.id', 'u.idpersona')
    .where('u.id', req.user.id)
    .select(
      'u.id', 'u.idpersona', 'u.nombre_usuario', 'u.nivel_acceso', 'u.estado',
      'p.apellidos', 'p.nombres', 'p.telefono', 'p.email', 'p.direccion'
    )
    .first()

  if (!usuario) throw httpError(404, 'Usuario no encontrado')
  res.json(usuario)
}
