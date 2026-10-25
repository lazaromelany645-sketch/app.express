const form = document.getElementById('form')
const msg = document.getElementById('msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  msg.textContent = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_usuario: document.getElementById('nombre_usuario').value.trim(),
        clave_acceso: document.getElementById('clave_acceso').value
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'No se pudo iniciar sesión')
    location.href = '/index.html'
  } catch (err) {
    msg.textContent = err.message
  }
})
