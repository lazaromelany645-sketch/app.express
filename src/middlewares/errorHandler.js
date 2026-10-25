const isProd = () => process.env.NODE_ENV === 'production'

// Rutas /api inexistentes
exports.notFound = (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
}

// Manejo central de errores
exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  let status = err.status || 500
  let message = err.message

  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON inválido' }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Solicitud demasiado grande' }
  else if (err.code === 'ER_DUP_ENTRY') { status = 409; message = 'El registro ya existe' }
  else if (err.code === 'ER_ROW_IS_REFERENCED_2') { status = 409; message = 'No se puede eliminar: tiene registros relacionados' }
  else if (err.code === 'ER_NO_REFERENCED_ROW_2') { status = 400; message = 'El registro relacionado no existe' }

  if (status >= 500) {
    console.error(err)
    if (isProd()) message = 'Error interno del servidor'
  }
  res.status(status).json({ message })
}
