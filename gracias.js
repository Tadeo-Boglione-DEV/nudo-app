// Página de gracias: Mercado Pago y PayPal vuelven acá después de pagar. Le pide a la función "tienda" que confirme
// el pago con el medio (no se acredita por lo que diga esta página) y ofrece volver a la app.
const q = new URLSearchParams(location.search), tit = document.getElementById('g-tit'), txt = document.getElementById('g-txt')
const poner = (t, x) => { tit.textContent = t; txt.textContent = x; document.title = t + ' · Ñudo' }
const medio = q.get('medio') === 'paypal' ? 'paypal' : 'mercadopago'
const mal = q.get('estado') === 'cancelado' || q.get('estado') === 'fallo' || ['rejected', 'null'].includes(q.get('status') ?? '') || q.get('collection_status') === 'rejected'
const id = medio === 'paypal' ? q.get('token') : (q.get('payment_id') || q.get('collection_id'))

if (mal || !id) poner('No se hizo el pago', 'No se te cobró nada. Si querés, probá de nuevo desde la Tienda de Ñudo.')
else fetch(window.NUBE.url + '/functions/v1/tienda', {
  method: 'POST', headers: { apikey: window.NUBE.key, 'content-type': 'application/json' },
  body: JSON.stringify(medio === 'paypal' ? { accion: 'confirmar', medio, orden: id } : { accion: 'confirmar', medio, pago: id }),
}).then(r => r.json()).then(r => {
  if (r.estado === 'ok' || r.estado === 'ya') poner('¡Gracias!', 'Listo: ya está en tu cuenta. Volvé a Ñudo y fijate en la Tienda.')
  else if (['pending', 'in_process', 'authorized', 'pendiente', 'approved'].includes(r.estado)) poner('Pago en camino', 'Todavía se está confirmando. Apenas se apruebe, aparece solo en la Tienda; no hace falta que hagas nada.')
  else poner('No pudimos confirmarlo', 'Si se te cobró, va a aparecer solo en la Tienda en unos minutos. Si no aparece, escribinos desde la página de Ñudo.')
}).catch(() => poner('Sin conexión', 'No pudimos confirmar el pago ahora. Si se te cobró, va a aparecer solo en la Tienda.'))
