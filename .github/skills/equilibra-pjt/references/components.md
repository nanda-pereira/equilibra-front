
# Arquivo: `equilibra-pjt/references/components.md`

# Componentes e padrões do Equilibra

Conteúdo: 1 Logo · 2 Botão · 3 Campo · 4 Chips e selos de status · 5 Etapas (stepper) · 6 Painel de vidro · 7 Consentimento · 8 Card · 9 Estrutura de app (menu + topo) · 10 Alertas · 11 Fundo da página · 12 Ícones e imagens

Valores exatos (hex, raios, efeitos) em `tokens.md`. Implementação de referência: `../assets/exemplo-criar-conta.html`.

## 1. Logo

- **Composição:** três pedras empilhadas (menor no topo, maior na base) + uma **curva** com um ponto na ponta, e o nome **EQUILIBRA** em Poppins SemiBold, caixa alta, espaçamento largo (~.32em).
- **Símbolo (assets/pedras-logo.png):** pedras e curva na cor `#4EA4A0`, fundo transparente.
- **Significado (use em apresentações e textos de marca):**
  - pedra do topo: atenção contínua, monitoramento constante;
  - pedra do meio: conexão entre paciente e profissional, a ponte;
  - pedra da base: segurança, a tecnologia que sustenta a relação;
  - curva: leveza e praticidade que a plataforma garante.
- **Variantes aprovadas:** colorida sobre claro; branca sobre verde água; monocromática escura; colorida sobre preto. Versões: horizontal (símbolo + nome), empilhada (símbolo acima do nome) e só símbolo (ícone de app, favicon, marca d'água).
- **Uso:** mantenha proporção; respiro ao redor igual à altura da pedra do meio (recomendação); símbolo isolado com no mínimo 24px de altura (recomendação). Não recolorir fora das variantes, não aplicar sombra/contorno, não girar.
- **Wordmark em código:** texto "EQUILIBRA" Poppins 600, `letter-spacing: .32em`, cor `#123F42`, ao lado do símbolo (gap 16px, símbolo com 56px de altura no cabeçalho de telas de acesso).

## 2. Botão

- **Pílula, 56px**, padding horizontal 32px, texto Poppins 600 16px, gap 10px entre texto e ícone.
- **Primário:** fundo `#247477`, texto branco, sombra suave. Hover `#1B5E60`. **Um por tela.**
- **Secundário:** fundo branco translúcido, contorno 2px `#247477`, texto `#247477`. Hover fundo `#E8F5F3`.
- **Ghost:** sem fundo, texto `#247477` (ações discretas, "Esqueci a senha").
- **Desabilitado:** fundo `#EEF2F1`, texto `#8A9594`. Evite: prefira manter ativo e explicar o erro ao clicar.
- **Setas:** "Voltar" com seta à esquerda, "Próximo" com seta à direita (traço 2px, 22px).
- Em mobile: largura total, empilhados (primário em cima).

## 3. Campo de texto

- Rótulo acima (16px, 500, `#282B2D`), gap 10px. Campo pílula 56px, fundo branco, borda 1,5px `#788685`, padding 0 24px, texto 16px.
- Placeholder `#6B7776`: exemplo real ("Maria Aparecida Silva", "DD/MM/AAAA", "000.000.000-00", "nome@email.com"); nunca repete o rótulo.
- Foco: borda `#247477` + anel de 4px. Erro: borda `#B3261E` 2px + texto de ajuda `#B3261E` 14px abaixo ("Campo obrigatório"), com ícone quando possível.
- Senha: mostrar/ocultar visível dentro do campo, à direita. Regras (do sistema): 8 ou mais caracteres, maiúscula, minúscula, número e símbolo; mostre-as como chips abaixo do campo.
- `autocomplete` correto (`name`, `bday`, `email`, `new-password`), `inputmode="numeric"` em CPF e datas.

## 4. Chips e selos de status

- **Chip informativo:** pílula 34px, fundo `#E3F2F0`, texto `#1B5E60` 14px 500, bolinha `#247477` à esquerda.
- **Selo de status:** pílula, padding 4px 12px, texto 14px 500, usando o par fundo/texto da tabela de status em `tokens.md`. Rótulos: **Estável**, **Atenção**, **Alerta**, **Informação**. Pode ter ícone (check, triângulo, sino, i).

## 5. Etapas (stepper)

- 4 segmentos de 112px (72px no mobile), barra de 6px, raio 999, gap 12px; concluídos e atual em `#247477`, futuros em `#C5E3E0`.
- Nome da etapa abaixo (14px; atual em 600 `#123F42`, demais `#1B5E60` ou `#586463`). `aria-current="step"` na atual.
- Acima do título, eyebrow "Etapa 2 de 4" (caixa alta, espaçamento .14em, `#1B5E60`).
- Nomes das etapas do cadastro: **Perfil, Seus dados, Conferir, Boas-vindas**.

## 6. Painel de vidro

Superfície principal de formulários e blocos de conteúdo em telas de acesso. Largura até 1040px, padding 48px, raio 32px, fundo branco 72%, borda branca 1px, anel verde-água 10%, sombra grande suave e desfoque de 24px (receita completa em `tokens.md`). Dentro: grade de 3 colunas (1 em mobile), depois blocos empilhados com gap 32px, e a linha de botões (Voltar à esquerda, primário à direita).

## 7. Bloco de consentimento

Bloco `#E8F5F3`, raio 20px, padding 20x24, checkbox de 24px (`accent-color #247477`) alinhado ao topo do texto; texto 16px com links em `#1B5E60` semibold: "Li e concordo com os Termos de Uso e a Política de Privacidade, incluindo o compartilhamento de dados de saúde com meus cuidadores e médico responsável." Abaixo do painel, linha de confiança com cadeado: "Seus dados de saúde são protegidos conforme a LGPD."

## 8. Card (telas internas)

Fundo branco, raio 24px, borda 1px `rgba(36,116,119,.10)`, sombra `0 8px 32px rgba(36,116,119,.08)`, padding 24px, gap 12px. Título 20px 600, valor 48px 600 quando for métrica, apoio 14px `#586463`. Métrica sempre com unidade e contexto ("76 bpm, estável").

## 9. Estrutura de app (menu + topo)

- **Menu lateral** 256px: logo no topo; itens de 48px, raio 12px (ou pílula), **ícone 24px + texto 16px sempre**; item ativo com fundo `#E8F5F3`, texto `#247477` 600. Itens por perfil em `screens.md`. Em mobile vira barra inferior com ícone + rótulo curto.
- **Topo:** saudação ("Bom dia, Maria") em Title/1; à direita, chip de sincronização do smartwatch ("Smartwatch conectado, sincronizado há 4 min") e avatar. Conteúdo com largura máxima de 1200px.
- **Anel de pontuação de bem-estar:** trilho `#C5E3E0`, progresso `#247477`, número 48px no centro, "de 100" 14px, frase de contexto abaixo ("Você está indo bem. Seus dados de hoje estão dentro do esperado.").
- **Gráficos:** linhas suaves `#247477` e `#4EA4A0`, sem grade pesada, rótulos 14px, alternativa em tabela/texto, estado vazio acolhedor.

## 10. Alertas

- Banner/card com ícone + título + horário relativo + ação ("Ver detalhes"). Fundo e texto do par de status correspondente; para queda use **Alerta**; mudança de padrão de tremor use **Atenção**.
- Não desaparece sozinho; exige ação ou "Entendi". Sem som obrigatório. Texto calmo e com próximo passo ("Maria Aparecida pode ter caído há 12 minutos. Ligue para confirmar").

## 11. Fundo da página (receita)

Base `#F4F9F8`; mancha 1: círculo 640px `#BFE3DF` (opacidade .70, `filter: blur(90px)`) em `top:-220px; left:-160px`; mancha 2: círculo 720px `#4EA4A0` (opacidade .22, blur 100px) em `bottom:-260px; right:-120px`; curva da marca (SVG, traço 3px `#4EA4A0` .45, ponto 6px) a 24px do rodapé; marca d'água do símbolo (340px, 7%) no canto inferior direito. Tudo `aria-hidden`.

## 12. Ícones e imagens

- Ícones: traço de 2px, pontas e cantos arredondados, 20 a 24px, cor herdada do texto (`#586463` neutro, `#247477` ativo). Sugerido: Lucide. Nunca emoji.
- Fotografia: pessoas idosas reais, expressão serena, luz natural, recorte suave com brilho verde água (como na seção "A solução" da landing). Evite banco de imagens genérico e rostos gerados por IA sem aviso.
- Ilustração: formas orgânicas e planas nos tons de menta, a curva e as pedras como motivo.