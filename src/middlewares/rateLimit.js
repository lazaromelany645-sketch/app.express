const { rateLimit } = require('express-rate-limit')

const base = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false }

// Límite general para toda la API
exports.apiLimiter = rateLimit({
  ...base,
  limit: 300,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
})

// Límite estricto para el login (fuerza bruta); solo cuentan los intentos fallidos
exports.loginLimiter = rateLimit({
  ...base,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { message: 'Demasiados intentos de inicio de sesión, intenta más tarde' }
})
