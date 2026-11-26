// Ñudos que van pasando, secciones que se apilan al bajar, y botones con la última versión (latest.json).
const $ = s => document.querySelector(s)
const calma = matchMedia('(prefers-reduced-motion: reduce)').matches

// ── hero: un Ñudo distinto cada pocos segundos ──
const pases = [...document.querySelectorAll('.pase')], txt = $('#pase-txt'), puntos = $('#puntos')
let i = 0, reloj
const mostrar = k => {
  i = (k + pases.length) % pases.length
  pases.forEach((p, j) => p.classList.toggle('on', j === i))
  txt.textContent = pases[i].dataset.label
  puntos.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', j === i))
}
pases.forEach((p, j) => {
  const b = document.createElement('button')
  b.setAttribute('role', 'tab'); b.setAttribute('aria-label', p.dataset.label)
  b.addEventListener('click', () => { mostrar(j); clearInterval(reloj); if (!calma) reloj = setInterval(() => mostrar(i + 1), 3200) })
  puntos.append(b)
})
if (pases.length) { mostrar(0); if (!calma) reloj = setInterval(() => mostrar(i + 1), 3200) }

// ── pila: cada panel queda quieto (aunque sea más alto que la pantalla) y el siguiente lo pisa ──
const panels = [...document.querySelectorAll('.panel')]
const fijar = () => panels.forEach(p => p.style.setProperty('--t', Math.min(0, innerHeight - p.offsetHeight) + 'px'))
let pend = false
const pisar = () => {
  pend = false
  panels.forEach((p, k) => {
    const next = panels[k + 1]
    if (!next) return
    const d = next.getBoundingClientRect().top                 // cuánto le falta al siguiente para tapar
    p.style.setProperty('--p', Math.max(0, Math.min(1, 1 - d / innerHeight)).toFixed(3))
  })
}
if (!calma) {
  fijar(); pisar()
  addEventListener('resize', () => { fijar(); pisar() })
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(pisar) } }, { passive: true })
  addEventListener('load', fijar)
}

// ── descargas ──
const mb = n => (n / 1048576).toFixed(n > 1048576 * 10 ? 0 : 1).replace('.', ',') + ' MB'
const ua = navigator.userAgent, plat = navigator.userAgentData?.platform ?? navigator.platform ?? ''
const mine = /Android/i.test(ua) ? 'android' : /iPhone|iPad/i.test(ua) ? 'ios' : /Win/i.test(plat) ? 'windows' : /Mac/i.test(plat) ? 'mac-arm64' : /Linux/i.test(plat) ? 'linux' : ''
const NAME = { windows: 'Windows', android: 'Android', 'mac-arm64': 'Mac', linux: 'Linux' }

fetch('latest.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(l => {
  $('#bajar-estado').textContent = `Versión ${l.version}, del ${new Date(l.date + 'T12:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}.`
  for (const li of document.querySelectorAll('#sistemas li')) {
    const f = l.files[li.dataset.k]
    if (!f) { li.classList.add('sin'); continue }
    const a = document.createElement('a')
    a.className = 'btn' + (li.dataset.k === mine ? ' primary' : '')
    a.href = f.url; a.textContent = 'Descargar · ' + mb(f.size)
    li.append(a)
    if (li.dataset.k === mine) li.classList.add('tuyo')
    const h = document.createElement('li')
    h.innerHTML = '<b></b><code></code>'; h.querySelector('b').textContent = f.name; h.querySelector('code').textContent = f.sha256
    $('#huellas').append(h)
  }
  const f = l.files[mine]
  if (f) { const b = $('#bajar-principal'); b.href = f.url; b.textContent = `Descargar para ${NAME[mine]}`; $('#version').textContent = `Versión ${l.version} · ${mb(f.size)} · también para los demás sistemas, más abajo.` }
  if (mine === 'ios') $('#version').textContent = 'En iPhone todavía no: Apple no deja instalarla fuera de su tienda. Está para Android, Windows, Mac y Linux.'
  fijar()
}).catch(() => { $('#bajar-estado').textContent = 'No pudimos ver la última versión. Probá recargar en un rato.' })
