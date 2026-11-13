// Diagnóstico do site (questionário em 5 passos, no padrão do mercado: qualificação
// primeiro, contato por último). As respostas vão por e-mail para a equipe
// (função "interessado" no Supabase); se ela não responder, abre um e-mail pronto.
(function () {
  const FUNCAO = 'https://pivphkmpacgbpqodjnds.supabase.co/functions/v1/bright-responder'
  const EMAIL = 'contact.eagleai@gmail.com'
  const APP = 'https://eagleaiagency.github.io/obrativa.github.io/'
  const FIM_PROMO = new Date('2027-01-31T23:59:59-03:00')
  const PLANOS = {
    light: { nome: 'Light', promo: 'R$ 69,90', regular: 'R$ 99,99', dia: 'R$ 2,33', diaRegular: 'R$ 3,33' },
    gestao: { nome: 'Gestão', promo: 'R$ 149,90', regular: 'R$ 199,90', dia: 'R$ 5,00', diaRegular: 'R$ 6,66' },
    completo: { nome: 'Completo', promo: 'R$ 249,90', regular: 'R$ 299,90', dia: 'R$ 8,33', diaRegular: 'R$ 10,00' },
  }
  const TOTAL = 5
  const form = document.getElementById('diag')
  const passos = [...form.querySelectorAll('.passo')]
  const r = {}
  let atual = 1

  // Escolhas em cartões: uma (radio) ou várias (data-multi)
  form.querySelectorAll('.pergunta').forEach((p) => {
    const campo = p.dataset.campo, multi = p.hasAttribute('data-multi')
    p.querySelectorAll('.opcoes button').forEach((b) => {
      b.setAttribute('aria-pressed', 'false')
      b.addEventListener('click', () => {
        if (multi) {
          const on = b.getAttribute('aria-pressed') !== 'true'
          b.setAttribute('aria-pressed', String(on))
          r[campo] = [...p.querySelectorAll('[aria-pressed="true"]')].map((x) => x.dataset.valor)
        } else {
          p.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
          r[campo] = b.dataset.valor
        }
        esconderErro()
      })
    })
  })

  // Máscara do WhatsApp: (00) 00000-0000
  const zap = form.elements.whatsapp
  zap.addEventListener('input', () => {
    const d = zap.value.replace(/\D/g, '').slice(0, 11)
    zap.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d
  })

  const erro = document.getElementById('erro')
  const mostrarErro = (t) => { erro.textContent = t; erro.hidden = false }
  const esconderErro = () => { erro.hidden = true }

  function ir(n) {
    atual = n
    passos.forEach((p) => { p.hidden = Number(p.dataset.passo) !== n })
    document.getElementById('passo-n').textContent = `Pergunta ${n} de ${TOTAL}`
    document.getElementById('barra').style.width = `${(n - 1) / TOTAL * 100 + 100 / TOTAL / 2}%`
    document.getElementById('voltar').hidden = n === 1
    document.getElementById('avancar').textContent = n === TOTAL ? 'Ver meu resultado' : 'Continuar'
    esconderErro()
    form.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const faltando = (n) => {
    const p = passos[n - 1]
    for (const q of p.querySelectorAll('.pergunta')) {
      const v = r[q.dataset.campo]
      if (!v || (Array.isArray(v) && !v.length)) return 'Escolha uma opção em cada pergunta para continuar.'
    }
    if (n === TOTAL) {
      if (!form.elements.nome.value.trim()) return 'Informe o seu nome.'
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.elements.email.value.trim())) return 'Confira o e-mail.'
      const z = form.elements.whatsapp.value.replace(/\D/g, '')
      if (z && z.length < 10) return 'Confira o WhatsApp com DDD, ou deixe em branco.'
    }
    return ''
  }

  // Recomendação: empreiteiros, contas a pagar/receber, mais de 5 obras ou 2 CNPJs → Completo;
  // sem obras e sem dor de obra → Light; o resto → Gestão
  function recomendar() {
    const dif = r.dificuldades || []
    const porque = []
    if (r.cnpjs === 'Sim') porque.push('tem mais de uma empresa (o Completo inclui 2 CNPJs)')
    if (r.empreiteiros === 'Sim') porque.push('trabalha com empreiteiros (pagamentos numerados e medições)')
    if (dif.includes('Contas a pagar e a receber')) porque.push('quer controlar contas a pagar e a receber, com lembretes')
    if (r.obras === 'Mais de 5') porque.push('toca mais de 5 obras ao mesmo tempo')
    if (porque.length) return { plano: 'completo', texto: `Você ${porque.join(', ')}. O Completo cobre tudo isso, além do controle de cada obra.` }
    const semObra = r.obras === 'Nenhuma agora' && !dif.some((d) => /obra|empreiteiro/i.test(d))
    if (semObra) return { plano: 'light', texto: 'Agora o que você precisa é organizar o caixa da empresa: bancos, entradas, saídas e relatórios. O Light faz isso, e você muda de plano quando as obras chegarem.' }
    return { plano: 'gestao', texto: 'Você precisa saber, de cada obra, quanto entrou, quanto saiu e quanto falta receber, sem planilha paralela. É exatamente o que o Gestão faz: um lançamento atualiza o caixa da empresa e o da obra.' }
  }

  async function enviar() {
    const rec = recomendar()
    const dados = {
      ...r,
      atividade: (r.atividade || []).join(', '), dificuldades: (r.dificuldades || []).join(', '),
      plano: PLANOS[rec.plano].nome,
      nome: form.elements.nome.value.trim(), empresa: form.elements.empresa.value.trim(), whatsapp: form.elements.whatsapp.value.trim(),
      email: form.elements.email.value.trim(), cidade: form.elements.cidade.value.trim(), novidades: form.elements.novidades.checked ? 'Sim' : 'Não',
      site: form.elements.site.value, origem: document.referrer || location.href,
    }
    const btn = document.getElementById('avancar')
    btn.disabled = true; btn.textContent = 'Enviando…'
    let ok = false
    try {
      const resp = await fetch(FUNCAO, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(dados) })
      ok = resp.ok
    } catch { ok = false }
    mostrarResultado(rec, dados, ok)
  }

  function mostrarResultado(rec, dados, enviado) {
    const p = PLANOS[rec.plano]
    form.hidden = true
    const res = document.getElementById('resultado')
    res.hidden = false
    document.getElementById('r-plano').textContent = p.nome
    document.getElementById('r-porque').textContent = rec.texto
    document.getElementById('r-promo').textContent = p.promo
    document.getElementById('r-regular').textContent = p.regular
    document.getElementById('r-dia').textContent = `cerca de ${p.dia} por dia, nos primeiros 12 meses`
    if (Date.now() > FIM_PROMO) { // promoção encerrada: vale o preço regular
      document.getElementById('r-promo').textContent = p.regular
      document.getElementById('r-regular').hidden = true
      document.getElementById('r-dia').textContent = `cerca de ${p.diaRegular} por dia`
    }
    document.getElementById('r-teste').href = `${APP}?plano=${rec.plano}`
    const env = document.getElementById('r-envio')
    if (enviado) env.textContent = 'Recebemos suas respostas. Se você pediu demonstração, a equipe Obrativa fala com você pelo WhatsApp ou e-mail informado.'
    else {
      // Sem a função no ar: e-mail pronto, para não perder o contato
      const corpo = Object.entries(dados).filter(([k, v]) => v && k !== 'site').map(([k, v]) => `${k}: ${v}`).join('\n')
      const link = `mailto:${EMAIL}?subject=${encodeURIComponent('Diagnóstico Obrativa · ' + dados.nome)}&body=${encodeURIComponent(corpo)}`
      env.innerHTML = ''
      env.append('Para a equipe falar com você, envie suas respostas: ')
      const a = document.createElement('a'); a.href = link; a.textContent = 'abrir o e-mail pronto'; env.append(a)
    }
    res.scrollIntoView({ block: 'start' })
  }

  document.getElementById('avancar').addEventListener('click', () => {
    const e = faltando(atual)
    if (e) return mostrarErro(e)
    if (atual < TOTAL) ir(atual + 1); else enviar()
  })
  document.getElementById('voltar').addEventListener('click', () => ir(Math.max(1, atual - 1)))
  form.addEventListener('submit', (e) => e.preventDefault())

  // Promoção de lançamento: contador até 31/01/2027 23:59 (Brasília); depois, some
  const contadores = document.querySelectorAll('[data-contador]')
  function tique() {
    const falta = FIM_PROMO - Date.now()
    if (falta <= 0) { document.querySelectorAll('[data-promo]').forEach((e) => { e.hidden = true }); return }
    const d = Math.floor(falta / 864e5), h = Math.floor(falta / 36e5) % 24, m = Math.floor(falta / 6e4) % 60
    contadores.forEach((c) => { c.textContent = `Termina em ${d} d ${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min.` })
  }
  tique(); setInterval(tique, 30000)

  ir(1)
})()
