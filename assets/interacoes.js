// Interações da landing: dúvidas que abrem num retângulo suave e o símbolo em 3D.
// São curtas e disparadas pelo próprio visitante, então ficam também com
// "reduzir movimento" (o visitante as dispara ou acompanha com o mouse).
(function () {
  const temGsap = !!window.gsap
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------------- Dúvidas: a resposta desce dentro do retângulo ---------------- */
  if (temGsap) {
    document.querySelectorAll('.faq details').forEach((d) => {
      const resumo = d.querySelector('summary'), caixa = d.querySelector('.resposta'), texto = caixa.querySelector('p'), icone = resumo.querySelector('.icone')
      let ocupado = false
      resumo.addEventListener('click', (e) => {
        e.preventDefault()
        if (ocupado) return
        ocupado = true
        if (d.open) {
          gsap.to(icone, { rotation: 0, duration: 0.3, ease: 'power2.out' })
          gsap.to(caixa, { height: 0, opacity: 0, marginBottom: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { d.open = false; gsap.set(caixa, { clearProps: 'height,opacity,marginBottom' }); ocupado = false } })
        } else {
          d.open = true
          gsap.to(icone, { rotation: 45, duration: 0.35, ease: 'back.out(2)' })
          gsap.fromTo(caixa, { height: 0, opacity: 0, marginBottom: 0 }, { height: 'auto', opacity: 1, marginBottom: 18, duration: 0.55, ease: 'expo.out', clearProps: 'height,marginBottom', onComplete: () => { ocupado = false } })
          gsap.fromTo(texto, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: 0.06, ease: 'expo.out', clearProps: 'transform' })
        }
      })
    })
  }

  /* ---------------- Símbolo em 3D: dois esquadros fecham em volta do caixa ---------------- */
  const cena = document.getElementById('cena')
  if (!cena) return
  // Geometria do símbolo oficial (grade de 256): esquadro de cima/esquerda, esquadro de baixo/direita e o caixa no centro
  const PRETO = { frente: '#151515', tras: '#151515', topo: '#55524b', esquerda: '#34322e', direita: '#24221f', base: '#0b0b0b' }
  const AMARELO = { frente: '#ffc21a', tras: '#ffc21a', topo: '#ffdb70', esquerda: '#f2b200', direita: '#d99c00', base: '#a87900' }
  const PROF = 40
  const pecas = {
    esq1: [[0, -76, 192, 40], [-76, -8, 40, 96]],
    esq2: [[76, 28, 40, 136], [-20, 76, 152, 40]],
    caixa: [[0, 0, 48, 48]],
  }
  const div = (classe, pai) => { const el = document.createElement('div'); el.className = classe; pai.appendChild(el); return el }
  const face = (pai, w, h, transformacao, cor) => {
    const f = div('face', pai)
    Object.assign(f.style, { width: w + 'px', height: h + 'px', left: -w / 2 + 'px', top: -h / 2 + 'px', transform: transformacao, background: cor })
  }
  const cuboide = (pai, [cx, cy, w, h], d, cores) => {
    const c = div('peca', pai)
    c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
    face(c, w, h, `translateZ(${d / 2}px)`, cores.frente)
    face(c, w, h, `rotateY(180deg) translateZ(${d / 2}px)`, cores.tras)
    face(c, d, h, `rotateY(90deg) translateZ(${w / 2}px)`, cores.direita)
    face(c, d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, cores.esquerda)
    face(c, w, d, `rotateX(90deg) translateZ(${h / 2}px)`, cores.topo)
    face(c, w, d, `rotateX(-90deg) translateZ(${h / 2}px)`, cores.base)
  }
  const raiz = div('simbolo3d', cena)
  const giro = div('giro', raiz)
  const grupos = {}
  for (const [nome, partes] of Object.entries(pecas)) {
    grupos[nome] = div('grupo', giro)
    const caixa = nome === 'caixa'
    partes.forEach((r) => cuboide(grupos[nome], r, caixa ? 48 : PROF, caixa ? AMARELO : PRETO))
  }

  // Tamanho: o símbolo (256) ocupa ~70% da figura
  const REPOUSO = { rotationX: -24, rotationY: -34, rotationZ: 0 }
  const escala = () => (cena.clientWidth * 0.7) / 256
  if (!temGsap) { raiz.style.transform = `scale(${escala()}) rotateX(-24deg) rotateY(-34deg)`; return }
  gsap.set(raiz, { scale: escala(), ...REPOUSO })
  addEventListener('resize', () => gsap.set(raiz, { scale: escala() }))

  // Montagem: o caixa chega, os dois esquadros fecham em volta dele, o conjunto assenta
  const tl = gsap.timeline({ delay: 0.55, defaults: { ease: 'expo.out' } })
  // (opacidade só na cena: opacidade num elemento 3D achata a profundidade)
  tl.fromTo('.figura .cena', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' })
    .fromTo(grupos.caixa, { z: 140, scale: 0.6 }, { z: 0, scale: 1, duration: 0.8 }, 0)
    .fromTo(grupos.esq1, { x: -90, y: -90, z: 50 }, { x: 0, y: 0, z: 0, duration: 1.1 }, '-=0.35')
    .fromTo(grupos.esq2, { x: 90, y: 90, z: 50 }, { x: 0, y: 0, z: 0, duration: 1.1 }, '<0.08')
    .fromTo(raiz, { rotationY: calmo ? -34 : -78, rotationX: calmo ? -24 : -8 }, { ...REPOUSO, duration: 1.6, ease: 'power3.out' }, 0)
    .fromTo('.figura .chao', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1 }, 0.2)

  // No computador, a figura vira para o lado do mouse (em qualquer ponto da página)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const rx = gsap.quickTo(giro, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(giro, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    addEventListener('pointermove', (e) => {
      const r = cena.getBoundingClientRect()
      if (r.bottom < 0) return // a figura já saiu da tela
      const nx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.55))
      const ny = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (innerHeight * 0.55))
      ry(nx * 26); rx(-ny * 18)
    }, { passive: true })
    document.documentElement.addEventListener('pointerleave', () => { rx(0); ry(0) })
  }
})()

// Atalhos do site (menu, "Ver o app em 1 minuto", "Comparar os planos"): rolagem suave até a seção
;(function () {
  if (!window.gsap) return
  const topo = () => (document.getElementById('topo')?.offsetHeight ?? 68) + 12
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const id = a.getAttribute('href')
    const alvo = id === '#inicio' || id === '#' ? document.body : document.querySelector(id)
    if (!alvo) return
    e.preventDefault()
    const destino = alvo === document.body ? 0 : Math.max(0, alvo.getBoundingClientRect().top + scrollY - topo())
    const distancia = Math.abs(destino - scrollY)
    const pos = { y: scrollY }
    // A duração cresce com a distância, sem passar de 1,2 s
    gsap.to(pos, {
      y: destino, duration: gsap.utils.clamp(0.45, 1.2, distancia / 2600), ease: 'power3.inOut', overwrite: true,
      onUpdate: () => window.scrollTo(0, pos.y),
      onComplete: () => {
        history.pushState(null, '', id)
        // o foco vai para a seção, para o leitor de tela e o teclado seguirem a rolagem
        if (alvo !== document.body) { alvo.setAttribute('tabindex', '-1'); alvo.focus({ preventScroll: true }) }
      },
    })
  })
})()
