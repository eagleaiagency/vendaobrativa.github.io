// Movimento da landing do Obrativa (GSAP 3.13 + ScrollTrigger).
// Cada animação explica algo: o lançamento que se divide, a faixa que enche
// conforme o cliente paga, o mesmo pagamento copiado em três lugares.
// "Reduzir movimento": sem deslocamento, desfoque, escala ou parallax; ficam só
// esmaecimentos curtos e os números recalculando. Sem GSAP, tudo já aparece no lugar.
(function () {
  const raiz = document.documentElement
  if (!window.gsap || !window.ScrollTrigger) { raiz.classList.remove('anima'); return }
  gsap.registerPlugin(ScrollTrigger)

  const SAI = 'expo.out'
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  let calmo = matchMedia('(prefers-reduced-motion: reduce)').matches

  const mm = gsap.matchMedia()
  mm.add({ grande: '(min-width: 761px)', pequeno: '(max-width: 760px)', reduzir: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { reduzir } = ctx.conditions
    const grande = ctx.conditions.grande && !reduzir
    calmo = reduzir
    // Estados de entrada: completo ou só opacidade
    const ENTRA = reduzir ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(4px)' }
    const NO_LUGAR = reduzir ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }
    const DUR = reduzir ? 0.4 : 0.7
    const desloca = (v) => (reduzir ? {} : v)
    // Toca uma vez e fica (once: true se desfaz no meio do cálculo quando a página recarrega já rolada)
    const em = (alvo, inicio = 'top 85%') => ({ trigger: alvo, start: inicio, toggleActions: 'play none none none' })

    const revelar = (alvos, opcoes = {}) => {
      const els = gsap.utils.toArray(alvos)
      if (!els.length) return
      gsap.fromTo(els, ENTRA, { ...NO_LUGAR, duration: DUR, ease: SAI, stagger: opcoes.stagger ?? 0.08, clearProps: 'filter,transform', scrollTrigger: em(opcoes.gatilho ?? els[0], opcoes.inicio) })
    }

    // Abertura: título em duas linhas, o grifo amarelo desenha sob "Cada obra também.", depois a tela do app
    const ab = gsap.timeline({ defaults: { ease: SAI } })
    ab.fromTo('.abertura .linha-t', ENTRA, { ...NO_LUGAR, duration: reduzir ? 0.5 : 0.8, stagger: 0.12, clearProps: 'filter,transform' })
      .fromTo('.marcado', { '--grifo': '0%' }, { '--grifo': '100%', duration: reduzir ? 0.01 : 0.7, ease: 'power3.inOut' }, '-=0.35')
      .fromTo(['.abertura .sub', '.abertura .ctas', '.abertura .preco-inicial', '.abertura .publico'], ENTRA,
        { ...NO_LUGAR, duration: DUR, stagger: 0.07, clearProps: 'filter,transform' }, '-=0.55')
      .fromTo('.palco-tela', { opacity: 0, ...desloca({ y: 40, scale: 0.98 }) }, { opacity: 1, ...desloca({ y: 0, scale: 1 }), duration: reduzir ? 0.5 : 1.1, clearProps: 'transform' }, '-=0.5')
    raiz.classList.remove('anima') // daqui em diante o GSAP controla os estados iniciais

    // A tela do app assenta ao rolar (telas grandes, sem "reduzir movimento")
    if (grande) {
      gsap.fromTo('.palco-tela .tela', { rotateX: 6, transformPerspective: 1400, transformOrigin: '50% 0%' },
        { rotateX: 0, ease: 'none', scrollTrigger: { trigger: '.palco-tela', start: 'top 90%', end: 'top 25%', scrub: 0.6 } })
    }

    // Dor: as frases entram; as três cópias saem de uma pilha (o mesmo pagamento, copiado)
    revelar('.dor h2, .dor .lead')
    revelar('.dores li', { stagger: 0.1 })
    const lugares = gsap.utils.toArray('.duplicado-lugar')
    if (lugares.length === 3) {
      const tl = gsap.timeline({ scrollTrigger: em('.duplicado', 'top 75%'), defaults: { ease: SAI } })
      tl.fromTo('.duplicado > .rot', { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(lugares[0], ENTRA, { ...NO_LUGAR, duration: 0.6, clearProps: 'filter' }, '<')
      if (reduzir) tl.fromTo(lugares.slice(1), { opacity: 0 }, { opacity: (i) => [0.58, 0.32][i], duration: 0.5, stagger: 0.2 })
      else tl.fromTo(lugares.slice(1), { y: (i) => -(lugares[i + 1].offsetTop - lugares[0].offsetTop), opacity: 0 }, { y: 0, opacity: (i) => [0.58, 0.32][i], duration: 0.9, stagger: 0.18 }, '-=0.2')
      tl.fromTo('.etiqueta-dup', { opacity: 0, ...desloca({ scale: 0.9 }) }, { opacity: 1, ...desloca({ scale: 1 }), duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
    }

    // Virada: um lançamento, depois as duas linhas, depois os dois controles recalculando
    revelar('.virada .cab h2, .virada .cab p')
    const vt = gsap.timeline({ scrollTrigger: em('#ramo', 'top 72%'), defaults: { ease: SAI } })
    vt.fromTo('.ramo .origem', ENTRA, { ...NO_LUGAR, duration: 0.6, clearProps: 'filter' })
      .fromTo('.ramo .linhas path', { strokeDashoffset: 160 }, { strokeDashoffset: 0, duration: reduzir ? 0.01 : 0.7, ease: 'power2.inOut', stagger: 0.08 }, '-=0.1')
      .fromTo('.ramo .destino', { opacity: 0, ...desloca(grande ? { x: -14 } : { y: 10 }) }, { opacity: 1, ...desloca({ x: 0, y: 0 }), duration: 0.6, stagger: 0.15, clearProps: 'transform' }, '-=0.35')
    gsap.utils.toArray('.ramo .numero').forEach((el, i) => {
      const antes = el.querySelector('.antes')
      const fim = el.childNodes[el.childNodes.length - 1]
      const de = Number(antes.textContent.replace(/\D/g, '')) / 100
      const ate = Number(fim.textContent.replace(/\D/g, '')) / 100
      const v = { n: de }
      fim.textContent = brl.format(de) // começa no saldo antigo e recalcula na tela
      vt.fromTo(antes, { opacity: 0 }, { opacity: 1, duration: 0.3 }, i ? '<' : '-=0.2')
        .to(v, { n: ate, duration: 0.9, ease: 'power2.out', onUpdate: () => { fim.textContent = brl.format(v.n) } }, '<')
    })
    revelar('.rodape-ramo')

    // Vídeo e cinco perguntas: a ficha responde uma pergunta por vez e a faixa enche até 90%
    revelar('#video h2, #video .lead')
    gsap.fromTo('.video-caixa', { opacity: 0, ...desloca({ y: 24, scale: 0.985 }) }, { opacity: 1, ...desloca({ y: 0, scale: 1 }), duration: 0.9, ease: SAI, clearProps: 'transform', scrollTrigger: em('.video-caixa') })
    revelar('.perguntas h2, .perguntas .lead')
    const ft = gsap.timeline({ scrollTrigger: em('.ficha', 'top 75%'), defaults: { ease: SAI } })
    ft.fromTo('.ficha', ENTRA, { ...NO_LUGAR, duration: 0.6, clearProps: 'filter' })
      .fromTo('.ficha .q', { opacity: 0, ...desloca({ x: -8 }) }, { opacity: 1, ...desloca({ x: 0 }), duration: 0.45, stagger: 0.09, clearProps: 'transform' }, '-=0.25')
    if (reduzir) ft.fromTo('.fita i.cheio, .fita i.parcial b', { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.07 }, '-=0.1')
    else ft.fromTo('.fita i.cheio, .fita i.parcial b', { scaleX: 0 }, { scaleX: 1, duration: 0.32, stagger: 0.07, ease: 'power2.out' }, '-=0.1')
    gsap.fromTo('.perguntas .tela', { opacity: 0, ...desloca({ y: 30 }) }, { opacity: 1, ...desloca({ y: 0 }), duration: 0.9, ease: SAI, clearProps: 'transform', scrollTrigger: em('.perguntas .tela') })

    // Funções: a tela do app se revela de baixo para cima, o texto materializa ao lado
    revelar('#funcoes > .envelope > h2')
    gsap.utils.toArray('.funcao').forEach((f) => {
      const tl = gsap.timeline({ scrollTrigger: em(f, 'top 78%'), defaults: { ease: SAI } })
      if (reduzir) tl.fromTo(f.querySelector('.tela'), { opacity: 0 }, { opacity: 1, duration: 0.5 })
      else tl.fromTo(f.querySelector('.tela'), { clipPath: 'inset(12% 0% 0% 0% round 12px)', y: 24, opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', y: 0, opacity: 1, duration: 1, clearProps: 'clipPath,transform' })
      tl.fromTo(f.querySelectorAll('.texto > *'), ENTRA, { ...NO_LUGAR, duration: DUR, stagger: 0.06, clearProps: 'filter,transform' }, reduzir ? '<' : '-=0.8')
    })
    revelar('.mais-funcoes > div', { stagger: 0.06, gatilho: '.mais-funcoes' })

    // Planos, dúvidas e chamada final
    revelar('.planos .cab > *')
    gsap.fromTo('.plano', { opacity: 0, ...desloca({ y: 28 }) }, { opacity: 1, ...desloca({ y: 0 }), duration: 0.8, stagger: 0.1, ease: SAI, clearProps: 'transform', scrollTrigger: em('.cartoes', 'top 82%') })
    revelar('.planos .rodape span', { stagger: 0.06 })
    revelar('.duvidas h2, .duvidas .lead')
    revelar('.faq details', { stagger: 0.04, gatilho: '.faq' })
    revelar('.final h2, .final p, .final .ctas .btn', { stagger: 0.08, gatilho: '.final' })

    // Fontes e imagens mudam a altura da página: recalcula os gatilhos
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  })
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

  // Mensal × anual: o número sai para cima e o novo entra de baixo (só troca o texto com "reduzir movimento")
  window.trocarPreco = (alvos, periodo) => {
    const trocar = () => alvos.forEach((el) => { el.textContent = el.dataset[periodo] })
    if (calmo) { gsap.timeline().to(alvos, { opacity: 0, duration: 0.12 }).add(trocar).to(alvos, { opacity: 1, duration: 0.2 }); return }
    gsap.timeline()
      .to(alvos, { y: -8, opacity: 0, filter: 'blur(3px)', duration: 0.16, ease: 'power2.in' })
      .add(trocar)
      .fromTo(alvos, { y: 8, opacity: 0, filter: 'blur(3px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.32, ease: SAI, clearProps: 'filter,transform' })
  }
})()
