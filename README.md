# Obrativa · site de vendas

Página única em HTML e CSS, sem build. Publicado pelo GitHub Pages a partir do repositório
`eagleaiagency/vendaobrativa.github.io` (esta pasta é a cópia local dele):
commit e push daqui atualizam o site.

## Antes de publicar

- **Endereço do app:** os botões apontam para `https://eagleaiagency.github.io/obrativa.github.io/` (com `?plano=light|gestao|completo` nos botões de cada plano). Quando houver domínio próprio, troque no `index.html`.
- **Páginas que faltam:** `privacidade.html` e `termos.html` estão no rodapé, mas
  ainda não existem (o plano comercial pede política de privacidade e termos).
- **Contato:** o plano comercial pede forma de contato e suporte; nenhum e-mail
  ou telefone foi inventado aqui.
- **Preços e teste de 14 dias:** são os valores de referência do plano comercial
  (Light R$ 59, Gestão R$ 129, Completo R$ 229; anual = 10 mensalidades).
- **Importação de extrato:** a página diz que chega na próxima etapa, como no
  plano comercial; o vídeo de apresentação mostra a função.

## Arquivos

- `assets/tela-*.webp`: capturas do app atual com a empresa de exemplo (fictícia).
- `assets/obrativa-video.mp4`: vídeo de lançamento v3 comprimido (4,2 MB), capa em `video-capa.webp`.
- `assets/GeneralSans-Variable.woff2` e os logos SVG: do kit da marca.
- `assets/gsap.min.js`, `assets/ScrollTrigger.min.js`: GSAP 3.13 (gratuito, inclusive para uso comercial).
- `assets/movimento.js`: as animações. Com "reduzir movimento" ligado no sistema,
  ficam só esmaecimentos curtos e os números recalculando; sem JavaScript, tudo
  aparece no lugar.

## Ver localmente

```bash
node ../obrativa/node_modules/vite/bin/vite.js . --port 5180
```
