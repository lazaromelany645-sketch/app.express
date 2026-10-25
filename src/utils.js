// Funcionalidades compartidas

// Simplifica el manejo de errores
exports.httpError = (status, message) =>
  Object.assign(new Error(message), { status })

// Campos obligatorios (en Express 5 req.body puede ser undefined)
exports.requireFields = (body, fields) => {
  body = body || {}
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
  )
  if (missing.length)
    throw exports.httpError(400, `Campos obligatorios: ${missing.join(', ')}`)
}

// Validar correo electrónico
exports.isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))

// Validar que un id de ruta sea un entero positivo
exports.parseId = (v) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1) throw exports.httpError(400, 'ID inválido')
  return n
}

// Validar usuario y contraseña
exports.checkCredentials = (
  { nombre_usuario, clave_acceso },
  { claveObligatoria }
) => {
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(nombre_usuario || ''))
    throw exports.httpError(400, 'Usuario: 3 a 50 caracteres (letras, números, _ . -)')

  if (
    (claveObligatoria || clave_acceso !== undefined) &&
    (typeof clave_acceso !== 'string' ||
      clave_acceso.length < 8 ||
      clave_acceso.length > 72)
  )
    throw exports.httpError(400, 'La contraseña debe tener entre 8 y 72 caracteres')
}
