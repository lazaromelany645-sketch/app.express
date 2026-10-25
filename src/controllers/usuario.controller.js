// Usuario = accede al app
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { httpError, requireFields, checkCredentials, parseId } = require('../utils')

// Perfiles o roles de usuario
const NIVELES = ['ADMIN', 'USUARIO']

// Consulta base (nunca incluye la clave)
const baseQuery = () =>
  db('usuarios as u')
    .join('personas as p', 'p.id', 'u.idpersona')
    .select(
      'u.id', 'u.idpersona', 'u.nombre_usuario', 'u.nivel_acceso', 'u.estado',
      'p.apellidos', 'p.nombres'
    )

const checkNivel = (nivel) => {
  if (nivel !== undefined && !NIVELES.includes(nivel))
    throw httpError(400, 'Nivel de acceso incorrecto')
}

const checkEstado = (estado) => {
  if (estado !== undefined && typeof estado !== 'boolean')
    throw httpError(400, 'Estado debe ser true o false')
}

const checkPersona = async (idpersona) => {
  const id = parseId(idpersona)
  const persona = await db('personas').where({ id }).first('id')
  if (!persona) throw httpError(400, 'La persona indicada no existe')
  return id
}

exports.list = async (req, res) => {
  res.json(await baseQuery().orderBy('u.id'))
}

exports.get = async (req, res) => {
  const row = await baseQuery().where('u.id', parseId(req.params.id)).first()
  if (!row) throw httpError(404, 'Usuario no existe')
  res.json(row)
}

exports.create = async (req, res) => {
  const body = req.body || {}
  requireFields(body, ['idpersona', 'nombre_usuario', 'clave_acceso'])
  const { nombre_usuario, clave_acceso, nivel_acceso, estado } = body

  checkNivel(nivel_acceso)
  checkEstado(estado)
  checkCredentials(body, { claveObligatoria: true })
  const idpersona = await checkPersona(body.idpersona)

  const datos = {
    idpersona,
    nombre_usuario,
    clave_acceso: await bcrypt.hash(clave_acceso, 10)
  }
  if (nivel_acceso !== undefined) datos.nivel_acceso = nivel_acceso
  if (estado !== undefined) datos.estado = estado

  const [id] = await db('usuarios').insert(datos)
  res.status(201).json({ id, message: 'Usuario creado' })
}

exports.update = async (req, res) => {
  const id = parseId(req.params.id)
  const body = req.body || {}
  requireFields(body, ['idpersona', 'nombre_usuario'])
  const { nombre_usuario, clave_acceso, nivel_acceso, estado } = body

  checkNivel(nivel_acceso)
  checkEstado(estado)
  checkCredentials(body, { claveObligatoria: false })

  // Reglas de negocio: un admin no puede quitarse a sí mismo el acceso
  if (id === req.user.id) {
    if (estado === false) throw httpError(400, 'No puedes desactivar tu propio usuario')
    if (nivel_acceso !== undefined && nivel_acceso !== 'ADMIN')
      throw httpError(400, 'No puedes quitarte el nivel ADMIN')
  }

  const datos = { idpersona: await checkPersona(body.idpersona), nombre_usuario }
  if (nivel_acceso !== undefined) datos.nivel_acceso = nivel_acceso
  if (estado !== undefined) datos.estado = estado
  if (clave_acceso !== undefined) datos.clave_acceso = await bcrypt.hash(clave_acceso, 10)

  const num = await db('usuarios').where({ id }).update(datos)
  if (!num) throw httpError(404, 'Usuario no existe')
  res.json({ message: 'Usuario actualizado' })
}

exports.remove = async (req, res) => {
  const id = parseId(req.params.id)
  if (id === req.user.id) throw httpError(400, 'No puedes eliminar tu propio usuario')

  const num = await db('usuarios').where({ id }).del()
  if (!num) throw httpError(404, 'Usuario no existe')
  res.json({ message: 'Usuario eliminado' })
}
