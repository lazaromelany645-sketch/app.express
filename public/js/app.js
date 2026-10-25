const msg = document.getElementById('msg')
const lista = document.getElementById('lista')
const form = document.getElementById('form')

// Fetch JSON; si la sesión expiró, vuelve al login
async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) { location.href = '/login.html'; throw new Error('Sesión expirada') }
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud')
  return data
}

function celda(texto) {
  const td = document.createElement('td')
  td.textContent = texto || ''
  return td
}

async function cargar() {
  const personas = await api('/api/personas')
  lista.replaceChildren()
  for (const p of personas) {
    const tr = document.createElement('tr')
    tr.append(celda(p.apellidos), celda(p.nombres), celda(p.email), celda(p.telefono))
    const td = document.createElement('td')
    const btn = document.createElement('button')
    btn.className = 'danger'
    btn.type = 'button'
    btn.textContent = 'Eliminar'
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar a ${p.nombres} ${p.apellidos}?`)) return
      try { await api(`/api/personas/${p.id}`, { method: 'DELETE' }); await cargar() }
      catch (err) { msg.textContent = err.message }
    })
    td.append(btn)
    tr.append(td)
    lista.append(tr)
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  msg.textContent = ''
  const body = {}
  for (const k of ['apellidos', 'nombres', 'email', 'telefono', 'direccion']) {
    const v = document.getElementById(k).value.trim()
    if (v) body[k] = v
  }
  try {
    await api('/api/personas', { method: 'POST', body: JSON.stringify(body) })
    form.reset()
    await cargar()
  } catch (err) { msg.textContent = err.message }
})

document.getElementById('salir').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  location.href = '/login.html'
})

;(async () => {
  try {
    const me = await api('/api/auth/me')
    document.getElementById('quien').textContent = `${me.nombres} ${me.apellidos} (${me.nivel_acceso})`
    await cargar()
  } catch (err) { /* api() ya redirige al login si hace falta */ }
})()
