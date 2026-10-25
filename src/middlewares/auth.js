const jwt = require('jsonwebtoken')
const { httpError } = require('../utils')

// Verifica el JWT guardado en la cookie "token"
exports.verifyToken = (req, res, next) => {
  const token = req.cookies && req.cookies.token
  if (!token) throw httpError(401, 'No autenticado')
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    throw httpError(401, 'Sesión inválida o expirada')
  }
  next()
}

// Restringe una ruta a uno o más niveles de acceso: requireLevel('ADMIN')
exports.requireLevel = (...levels) => (req, res, next) => {
  if (!req.user || !levels.includes(req.user.nivel_acceso))
    throw httpError(403, 'Acceso denegado')
  next()
}
