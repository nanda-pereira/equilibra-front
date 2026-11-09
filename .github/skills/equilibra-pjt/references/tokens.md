
# Arquivo: `equilibra-pjt/references/tokens.md`

# Tokens do Equilibra

Conteúdo: 1 Cores · 2 Status · 3 Tipografia · 4 Forma e espaço · 5 Efeitos · 6 Bloco CSS (Tailwind v4) · 7 Figma

Todas as razões de contraste foram calculadas (WCAG). AA = 4,5:1 para texto normal.

## 1. Cores

| Token (Figma) | CSS | Hex | Uso | Contraste |
|---|---|---|---|---|
| `color/brand/main` | `--color-brand` | `#4EA4A0` | Logo, curva, decoração, ícones grandes | 2,94:1 sobre branco: **nunca texto/botão** |
| `color/bg/action` | `--color-action` | `#247477` | Botão primário, links, ícones de ação | 5,47:1 com branco |
| `color/bg/action-hover` | `--color-action-hover` | `#1B5E60` | Hover/pressionado | 7,46:1 com branco |
| (títulos) | `--color-deep` | `#123F42` | Títulos de destaque, wordmark | 10,9:1 sobre `#F4F9F8` |
| `color/bg/page` | `--color-page` | `#F4F9F8` | Fundo da página | |
| `color/bg/surface` | `--color-surface` | `#FFFFFF` | Cards, painéis | |
| `color/bg/subtle` | `--color-mint-100` | `#E8F5F3` | Blocos suaves (consentimento, item ativo) | `#1B5E60` sobre ele: 6,67:1 |
| (apoio) | `--color-mint-200` | `#C5E3E0` | Segmentos de etapa inativos, mancha de fundo | só decoração |
| `color/bg/disabled` | `--color-disabled` | `#EEF2F1` | Fundo desabilitado | |
| `color/text/primary` | `--color-ink` | `#282B2D` | Texto principal | 14,25:1 sobre branco |
| `color/text/secondary` | `--color-ink-soft` | `#586463` | Texto de apoio | 5,78:1 sobre `#F4F9F8` |
| `color/text/disabled` | `--color-ink-disabled` | `#8A9594` | Só desabilitado | 3,08:1 (não usar em conteúdo) |
| (placeholder) | `--color-placeholder` | `#6B7776` | Placeholder de campo | 4,64:1 sobre branco |
| `color/border/default` | `--color-line` | `#CBD5D3` | Divisórias e bordas de card | decorativo |
| (borda de campo) | `--color-field-border` | `#788685` | Borda de input (3,79:1 sobre branco) | WCAG 1.4.11 |
| `color/border/focus` | `--color-action` | `#247477` | Foco | |

Manchas de fundo (decorativas): `#BFE3DF` (opacidade .70, desfoque 90px) e `#4EA4A0` (opacidade .22, desfoque 100px).

## 2. Status (fundo + texto, todos passam AA)

| Estado | Rótulo | Fundo | Texto | Razão |
|---|---|---|---|---|
| Sucesso / risco Baixo | Estável | `#E3F4EA` | `#1F6B42` | 5,68:1 |
| Atenção / risco Médio | Atenção | `#FFF4D6` | `#7A5600` | 6,07:1 |
| Alerta / risco Alto | Alerta | `#FDE8E7` | `#B3261E` | 5,56:1 |
| Informação | Informação | `#E3F1FB` | `#1B5E8C` | 6,03:1 |

Sempre com texto (e ícone quando houver espaço). Nunca só uma bolinha colorida.

## 3. Tipografia (Poppins)

| Estilo | Peso | Tamanho / linha | Uso |
|---|---|---|---|
| Display/Title | 600 | 44 / 52 | Título de telas de acesso (criar conta, login) |
| Title/1 | 600 | 32 / 40 | Título de página interna, hero em telas menores |
| Title/2 | 600 | 24 / 32 | Seção |
| Title/3 | 600 | 20 / 28 | Título de card |
| Display/Number | 600 | 48 / 56 | Pontuação de bem-estar, métricas-chave |
| Body/Large | 400 | 18 / 28 | Subtítulo, texto de introdução |
| Body/Default | 400 | 16 / 24 | Texto padrão |
| Body/Small | 400 | 14 / 20 | Apoio, legendas (**mínimo**) |
| Label/Default | 500 | 14 / 20 | Rótulo compacto |
| Field label | 500 | 16 / 24 | Rótulo de campo em formulários |
| Button/Default | 600 | 16 / 24 | Texto de botão |
| Wordmark | 600 | 24, espaçamento .32em | "EQUILIBRA" |
| Eyebrow | 500 | 14, espaçamento .14em, caixa alta | Rótulo acima de título ("Etapa 2 de 4", "O problema") |

Carregar: `Poppins` 400, 500, 600. Fallback `ui-sans-serif, system-ui, sans-serif`.

## 4. Forma e espaço

- Raios: pílula `999px` (campos, botões, chips, barras de etapa) · painel `32px` · card `24px` · bloco `20px` · checkbox `8px`.
- Alturas: campo 56 · botão 56 · chip 34 · item de menu 48 · barra de etapa 6.
- Espaçamento em múltiplos de 4: 4, 8, 12, 16, 24, 32, 48. Padding do painel 48 (desktop), 28 x 20 (mobile). Grade de campos: 3 colunas, gap 28 (vertical) e 24 (horizontal).
- Larguras: tela 1440 · painel/formulário até 1040 · conteúdo até 1120 · quebra para 1 coluna abaixo de 900px.

## 5. Efeitos

- **Painel de vidro:** `background: rgba(255,255,255,.72); border: 1px solid #fff; box-shadow: 0 0 0 1px rgba(36,116,119,.10), 0 24px 64px rgba(36,116,119,.12); backdrop-filter: blur(24px)`.
- **Botão primário:** sombra `0 10px 24px rgba(36,116,119,.28)`.
- **Foco de campo:** borda `#247477` + `box-shadow: 0 0 0 4px rgba(36,116,119,.18)`.
- **Curva da marca:** traço 3px `#4EA4A0`, opacidade .45, pontas arredondadas, ponto de 6px na ponta.
- **Marca d'água:** símbolo da logo a 7% de opacidade, ~340px, canto inferior direito.
- **Movimento:** transições de 150 a 200ms, sem animações chamativas; respeite `prefers-reduced-motion`.

## 6. Bloco CSS pronto (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;

  --color-brand: #4EA4A0;
  --color-action: #247477;
  --color-action-hover: #1B5E60;
  --color-deep: #123F42;
  --color-page: #F4F9F8;
  --color-surface: #FFFFFF;
  --color-mint-100: #E8F5F3;
  --color-mint-200: #C5E3E0;
  --color-disabled: #EEF2F1;
  --color-ink: #282B2D;
  --color-ink-soft: #586463;
  --color-ink-disabled: #8A9594;
  --color-placeholder: #6B7776;
  --color-line: #CBD5D3;
  --color-field-border: #788685;

  --color-success-bg: #E3F4EA;   --color-success-text: #1F6B42;
  --color-attention-bg: #FFF4D6; --color-attention-text: #7A5600;
  --color-alert-bg: #FDE8E7;     --color-alert-text: #B3261E;
  --color-info-bg: #E3F1FB;      --color-info-text: #1B5E8C;

  --radius-pill: 999px;
  --radius-panel: 32px;
  --radius-card: 24px;
  --radius-block: 20px;
}

body { font-family: var(--font-sans); background: var(--color-page); color: var(--color-ink); }
```

## 7. Figma

Arquivo "EQUILIBRA". Existem coleções de variáveis **Primitives**, **Colors** (semânticas, modo Light) e **Spacing and radius**, mais estilos de texto Poppins (`Title/1`, `Title/2`, `Title/3`, `Display/Number`, `Body/Large`, `Body/Default`, `Body/Small`, `Label/Default`, `Button/Default`) e componentes Button, Status Badge, Input, Card e Menu Item (frames "DS / Foundations" e "DS / Components", na página de paleta). **Atenção:** esses componentes foram criados com campo de 48px e raio 12px; o estilo aprovado exige **pílula de 56px**. Atualize ao usá-los (ainda faltam também `radius/xl` 24, `radius/2xl` 32 e o estilo `Display/Title` 44/52).


================================================================================
