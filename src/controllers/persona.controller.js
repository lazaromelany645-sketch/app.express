const db = require('../config/db')
const { httpError, requireFields, isEmail, parseId } = require('../utils')

const campos = ['apellidos', 'nombres', 'telefono', 'email', 'direccion']

// Toma solo los campos permitidos, exige texto y limpia espacios
const pick = (body) =>
  Object.fromEntries(
    campos
      .filter((key) => key in body)
      .map((key) => {
        const v = body[key]
        if (v !== null && typeof v !== 'string')
          throw httpError(400, `El campo ${key} debe ser texto`)
        return [key, typeof v === 'string' ? (v.trim() || null) : v]
      })
  )

// Validaciones comunes de registrar / actualizar
const validar = (body) => {
  requireFields(body, ['apellidos', 'nombres', 'email'])
  const datos = pick(body)
  if (!isEmail(datos.email)) throw httpError(400, 'Email incorrecto')
  if (datos.telefono && !/^\d{9}$/.test(datos.telefono))
    throw httpError(400, 'El teléfono debe tener 9 dígitos')
  return datos
}

exports.list = async (req, res) => {
  res.json(await db('personas').select('id', ...campos).orderBy('apellidos'))
}

exports.get = async (req, res) => {
  const row = await db('personas').where({ id: parseId(req.params.id) }).first()
  if (!row) throw httpError(404, 'Persona no encontrada')
  res.json(row)
}

exports.create = async (req, res) => {
  const datos = validar(req.body || {})
  const [id] = await db('personas').insert(datos)
  res.status(201).json({ id, message: 'Persona registrada' })
}

exports.update = async (req, res) => {
  const id = parseId(req.params.id)
  const datos = validar(req.body || {})
  const num = await db('personas').where({ id }).update(datos)
  if (!num) throw httpError(404, 'Persona no encontrada')
  res.json({ message: 'Persona actualizada' })
}

exports.remove = async (req, res) => {
  const num = await db('personas').where({ id: parseId(req.params.id) }).del()
  if (!num) throw httpError(404, 'Persona no encontrada')
  res.json({ message: 'Persona eliminada' })
}
