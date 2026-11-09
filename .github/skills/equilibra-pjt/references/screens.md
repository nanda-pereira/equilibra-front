
# Arquivo: `equilibra-pjt/references/screens.md`

# Telas, conteúdo e regras do Equilibra

Conteúdo: 1 Prioridades · 2 Mapa de telas por perfil · 3 Landing page · 4 Cadastro e login · 5 Dashboards · 6 IA e eventos · 7 Dados de exemplo · 8 Regras de negócio que mudam a interface

Fonte: documentos do grupo (especificação de requisitos, funcionalidades, priorização) e telas aprovadas. Onde o documento é ambíguo, está sinalizado.

## 1. Prioridades (do grupo)

- **Alta:** cadastro e login (6 telas), landing page, dashboards (4 telas). O design system e a logo vêm antes de tudo.
- **Média:** perfil, monitoramento do smartwatch, agenda (médico), evolução clínica, histórico de eventos (2 telas), IA (1 tela), plano de tratamento e relatórios (média/baixa).
- **Baixa:** medicamentos, exercícios, observações clínicas, comunicação, chatbot de lembretes, configurações.
- Telas citadas como a prototipar: dashboard do cuidador, perfil do cuidador (domiciliar e clínico), perfil do neuro, monitoramento (smartwatch), subtelas, observações clínicas, cadastro (cuidador e neuro), landing.
- Evolução clínica: completa para o médico; versão básica para os cuidadores (o médico vê o que os cuidadores relataram).

## 2. Mapa de telas por perfil

Módulos compartilhados (variam só as permissões): login e cadastro, dashboard, perfil, pacientes, monitoramento pelo smartwatch, IA, histórico de eventos, plano de tratamento, medicamentos, exercícios, agenda, evolução clínica, observações, comunicação, relatórios, configurações.

**Paciente** (simples, rotina diária)
- Dashboard: pontuação de bem-estar, status ("Tudo dentro do esperado", "Monitorando", "Atenção"), última sincronização, próximo medicamento, próximo exercício, próxima consulta, últimos eventos, resumo da atividade.
- Monitoramento (Hoje / Semana / Mês): frequência cardíaca, tremores, passos, distância, equilíbrio, mobilidade, sono, tempo ativo e sedentário.
- Histórico da IA: quedas, tremores elevados, alterações cardíacas, da marcha, inatividade, do sono; cada evento com data, hora, gravidade, descrição e recomendação.
- Também: perfil (foto, telefone, endereço, contatos de emergência, senha), plano de tratamento (leitura), medicamentos (confirmar, informar esquecimento), exercícios (marcar feito, dificuldade, dor, enviar vídeo/foto), agenda, diário (humor, dor, dificuldades), comunicação, relatórios, configurações (notificações, tema, fonte, acessibilidade).

**Médico** (acesso clínico completo, sem notificações em tempo real)
- Dashboard: pacientes ativos, novos, agenda, pacientes com piora recente, sem acompanhamento, evolução geral.
- Pacientes: cadastrar, editar, arquivar, buscar, filtrar, vincular cuidadores. Prontuário (dados, histórico, diagnóstico, estágio, comorbidades, alergias, exames).
- Monitoramento com comparação de dias, semanas e meses; histórico da IA; plano de tratamento (criar, editar, revisar); medicamentos (prescrever, ajustar, suspender); exercícios (criar, anexar vídeo/PDF/imagem, frequência, dificuldade); evolução clínica (gráficos, tendências, adesão); observações clínicas; relatórios em PDF; comunicação.

**Cuidador clínico** (vários pacientes, tempo real)
- Dashboard: todos os pacientes, alertas ativos, próximos medicamentos, exercícios pendentes. Monitoramento (batimentos, tremores, quedas, sono, mobilidade, equilíbrio) com notificações em tempo real. Medicamentos, exercícios (se autorizado pelo médico, sempre dentro do plano), agenda, observações (evolução diária, intercorrências, alimentação, humor), comunicação, relatórios.

**Cuidador domiciliar** (extremamente simples, normalmente familiar)
- Dashboard: estado do paciente, medicamento atual, próxima atividade, alertas recentes. Monitoramento (tremores, sono, batimentos, caminhada, quedas) e notificações em tempo real. Confirmar medicamento (administrado, atrasou, recusou), acompanhar exercícios, agenda, diário do cuidador (alimentação, humor percebido, ocorrências, quedas presenciadas), comunicação. **Só visualiza status atual e alertas.**

**Itens de menu sugeridos:** Início, Monitoramento, Eventos, Agenda, Medicamentos, Exercícios, Relatórios, Mensagens, Perfil. O médico troca por: Início, Pacientes, Agenda, Evolução clínica, Relatórios, Mensagens, Configurações. Paciente e cuidador domiciliar mostram **poucos itens** (no máximo 6).

## 3. Landing page (protótipo do Figma)

Base 1440px, fundo claro com brilho verde água, seções alternando fundo branco e menta suave.

1. **Cabeçalho:** logo; navegação Início, Sobre, Como funciona, Para quem, Benefícios; botão **Acesso à plataforma**.
2. **Hero:** título "Mais segurança para estar em movimento."; texto "O Equilibra é uma plataforma inteligente que monitora os sinais motores, detecta riscos de quedas e conecta pacientes, cuidadores e profissionais de saúde."; botões **Acesso à plataforma** (primário) e **Saiba mais** (secundário).
3. **O problema** ("O que torna o Parkinson ainda mais desafiador?"): 3 cards: *Monitoramento contínuo* (consultas esporádicas não capturam as variações do quadro motor), *Insegurança e falta de dados* (medo de quedas e ausência de dados confiáveis), *Envelhecimento da população* (reforça a necessidade de soluções preventivas).
4. **A solução** ("E se existir uma plataforma completa, que une tecnologia, dados e cuidado?"): foto de pessoa idosa com brilho verde água + 3 itens: *App para smartwatch + IA*, *Detecção precoce*, *Apoio e contato clínico*; link "Saiba como funciona".
5. **Para quem é o Equilibra?** ("Um ecossistema de cuidado que conecta todos os lados"): 4 cards: *Pacientes*, *Famílias e cuidadores*, *Profissionais da saúde*, *Clínicas e hospitais*. (No protótipo esta seção está rotulada por engano como "A SOLUÇÃO": o rótulo correto é "Para quem".)
6. **Como funciona:** 4 passos ligados pela **curva da marca**: Coleta de dados, Análise inteligente, Alertas e relatórios, Acompanhamento.
7. **Chamada final** (fundo teal escuro `#1B5E60`): "Dê o primeiro passo para um cuidado mais seguro."; texto sobre comunidade de usuários; botão **Comece já!**; mockup de celular com "Boas-vindas".
8. **Rodapé:** logo, redes, "2026. Todos os direitos reservados."

Textos provisórios do protótipo (lorem ipsum) devem ser trocados por texto real. Ícones circulares cinza são placeholders: substituir por ícones de traço.

## 4. Cadastro e login

**Cadastro (4 etapas)** com o stepper de `components.md`:
1. **Perfil:** "Para começarmos, nos conte: em qual desses perfis você se encaixa mais?" Quatro cards iguais, alinhados, com ícone real, título e frase: *Paciente* ("Quero acompanhar minha saúde"), *Médico* ("Acompanho pacientes clinicamente e quero gerenciá-los"), *Cuidador clínico* ("Sou cuidador e monitoro pacientes clinicamente"), *Cuidador domiciliar* ("Sou um cuidador familiar, responsável domesticamente"). Card selecionado: borda `#247477` 2px + fundo `#E8F5F3`.
2. **Seus dados:** tela de referência `assets/exemplo-criar-conta.html`. Campos do paciente (RF01): nome completo, data de nascimento, CPF, e-mail, senha, confirmação; opcionais/posteriores: diagnóstico, médico responsável, nome e contato do cuidador.
   - Médico (RF02): nome, CRM, especialidade, e-mail. Cuidador (RF03): nome, especialidade/tipo, e-mail. A especificação tem inconsistências nos campos de cuidador; **confirmar antes de implementar**.
3. **Conferir** ("Verifique seus dados"): mesmos dados em modo de revisão, com botão "Editar" por bloco.
4. **Boas-vindas:** "Você terminou a criação da sua conta! Vamos a uma apresentação breve." Área de vídeo/slides curtos e botão **Começar**.

**Login:** tela larga no estilo de `exemplo-criar-conta.html`: painel de vidro e **não** cartão estreito. Entrada por **e-mail ou número de registro** + senha, "Manter conectado", "Esqueci a senha", botão **Entrar**, link "Ainda não tem conta? Criar conta". Profissionais de saúde têm **autenticação de dois fatores** disponível.

**Regras de senha:** mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial; troca a cada 3 meses, sem repetir senhas anteriores.

## 5. Dashboards

Princípios: hierarquia clara (uma coisa principal por tela), poucos blocos, números grandes, frases humanas, tudo com contexto e tendência ("↓ menor que ontem").

- **Paciente:** saudação, chip de sincronização, **anel de pontuação de bem-estar** (ex.: 82 de 100) com frase de apoio, 4 cards (frequência cardíaca, tremores, passos com meta, sono) e lista **Hoje** (medicamento com botão Confirmar, exercício com "Feito", consulta com "Ver detalhes").
- **Médico:** cards-resumo (pacientes ativos, consultas hoje, requerem atenção), busca + filtros em pílula (Todos, Requer atenção, Consulta hoje) e tabela: paciente (avatar, idade, estágio), pontuação, tendência (selo), última sincronização, ação "Ver".
- **Cuidador clínico:** lista de pacientes com status em selo, **alertas ativos** em destaque, próximos medicamentos e exercícios pendentes.
- **Cuidador domiciliar:** uma tela quase só de leitura: cartão grande "Como está Maria hoje" com selo de status, próximo medicamento com botão de confirmar, próxima atividade, alertas recentes. Sem tabelas.

## 6. IA e eventos

- A IA recebe frequência cardíaca, tremores, mobilidade, padrão de marcha, equilíbrio, passos e sono; identifica possíveis quedas, alterações de tremor e de marcha, alterações cardíacas, inatividade prolongada, tendências e pontuação de bem-estar.
- Classificação: **Baixo / Médio / Alto** → exibir como **Estável / Atenção / Alerta**. Alto: alerta imediato; Médio: notificação no próximo ciclo; Baixo: só registro, sem alerta ativo.
- Distribuição: o paciente vê seu estado e recomendações; cuidadores recebem notificações em tempo real; o médico consulta histórico, gráficos e tendências nas consultas.
- Modo degradado: se a análise falhar, o sistema continua registrando dados; mostre aviso discreto ("Análise indisponível; seus dados continuam sendo registrados").
- Dispositivo offline: dados são guardados e sincronizados depois; mostre "Última sincronização" sempre.

## 7. Dados de exemplo (use de forma consistente)

- **Paciente:** Maria Aparecida, 68 anos, Osasco (SP), Parkinson em estágio inicial; pontuação 82; tremores leves; 76 bpm; 3.240 passos (meta 5.000); sono 7h20.
- **Cuidadora domiciliar:** Amanda (filha). **Médica:** Dra. Marina Andrade, Neurologia.
- **Outros pacientes (listas do médico):** João Ferreira, Ana Souza, Carlos Ferreira, com idades e estágios variados.
- **Eventos:** "Alerta de queda, há 12 minutos" (Alerta); "Alteração no padrão de tremor, há 1 hora" (Atenção); "Nova conexão" (Informação).
- Dispositivo: smartwatch. Medicamento de exemplo: Levodopa 12:00. Exercício: "Alongamento e equilíbrio, 15 min".

## 8. Regras de negócio que mudam a interface

- Cuidadores e familiares só **visualizam** status atual e alertas (sem editar/excluir).
- Médicos e profissionais de saúde acessam tudo dos pacientes **vinculados**; pacientes veem os próprios dados.
- Relatórios só são gerados por médico/profissional autorizado; período máximo de 12 meses; exportação em **PDF ou CSV**.
- Cada dispositivo vincula a **um único paciente**; só transmite após confirmar a conexão dispositivo-paciente (tela de pareamento clara e simples).
- LGPD: consentimento explícito para compartilhar dados de saúde; log de acessos.
- Desempenho percebido: dashboard em até 4 s e relatório em até 8 s (use estados de carregamento calmos e esqueleto, não spinner nervoso).
- Compatibilidade: web (Chrome, Firefox, Safari, Edge) e app Android/iOS, interface responsiva em celular, tablet e desktop.