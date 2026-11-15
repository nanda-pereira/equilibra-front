# Equilibra - Tecnologia que transforma movimento em cuidado

<p align="center">
  <img src="src/assets/pedras-logo.svg" alt="Logo do Equilibra" width="120" />
</p>

<p align="center">
  Plataforma digital de apoio ao acompanhamento e ao cuidado de pessoas com doença de Parkinson.
</p>

<p align="center">
  <a href="https://equilibra-plataforma.vercel.app/">Acessar plataforma</a> ·
  <a href="#sobre-o-projeto">Sobre</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#tecnologias">Tecnologias</a> ·
  <a href="#como-executar">Como executar</a>
</p>

---

## Sobre o projeto
O **Equilibra** é uma plataforma digital desenvolvida para apoiar o acompanhamento de pessoas com doença de Parkinson, aproximando pacientes, familiares, cuidadores e profissionais de saúde em um ambiente integrado.

A proposta é facilitar a organização da rotina de cuidado, centralizar informações relevantes e proporcionar uma experiência digital acessível, intuitiva e acolhedora.

O projeto combina desenvolvimento web, organização de informações e recursos voltados ao acompanhamento contínuo, considerando as necessidades dos diferentes perfis envolvidos no cuidado.

## Funcionalidades
A plataforma é organizada em módulos que atendem às diferentes etapas da experiência do usuário.

| Módulo | O que oferece |
|---|---|
| **Landing page** | Apresentação da plataforma, sua proposta de valor e seus principais recursos. |
| **Autenticação e cadastro** | Fluxos de acesso e criação de conta para os usuários. |
| **Painel do paciente** | Centralização de informações e recursos relacionados à rotina de acompanhamento. |
| **Painel médico** | Área destinada ao acompanhamento de pacientes e à consulta de informações relevantes. |
| **Painel do cuidador** | Recursos de apoio à organização e ao acompanhamento do cuidado. |
| **Área administrativa** | Módulo destinado à administração e ao gerenciamento da plataforma. |
| **Medicamentos** | Organização das informações relacionadas aos medicamentos do paciente. |
| **Plano de tratamento** | Centralização de informações referentes ao planejamento do cuidado. |
| **Agenda** | Organização de compromissos e atividades relacionados ao acompanhamento. |
| **Rede de cuidado** | Recursos para conectar os participantes envolvidos no cuidado do paciente. |
| **Evolução clínica** | Área destinada ao registro e à consulta de informações sobre a evolução do paciente. |
| **Monitoramento** | Módulo voltado ao acompanhamento de informações relevantes ao longo do tempo. |
| **Relatórios** | Organização e apresentação de informações em relatórios. |
| **Mensagens** | Área de comunicação entre os participantes da plataforma. |
| **Perfil e configurações** | Gerenciamento de informações do usuário e de preferências da aplicação. |
| **Termos de uso e privacidade** | Páginas com informações legais e orientações sobre o uso da plataforma. |

> **Importante:** os módulos listados representam a estrutura e as funcionalidades previstas na plataforma. A disponibilidade, a integração e o funcionamento de cada recurso podem variar conforme o estágio de desenvolvimento.

## Tecnologias
| Tecnologia | Utilização |
|---|---|
| React | Construção da interface e dos componentes. |
| TypeScript | Tipagem estática e maior previsibilidade no desenvolvimento. |
| Vite | Ambiente de desenvolvimento e geração do build. |
| Tailwind CSS | Estilização e composição visual das páginas. |
| React Router | Gerenciamento da navegação entre páginas. |
| Recharts | Construção de gráficos e visualizações de dados. |
| jsPDF | Geração de documentos em PDF. |
| ESLint | Análise estática e padronização do código. |

## Arquitetura
O Frontend adota uma arquitetura de **monólito modular**, mantendo uma única aplicação organizada em páginas, componentes reutilizáveis e módulos separados por responsabilidade.

Essa abordagem busca favorecer a manutenção do código, a evolução gradual da plataforma e a colaboração entre os integrantes do projeto.

## Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/)
- npm
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/nanda-pereira/equilibra-front.git
```

### 2. Entre na pasta do projeto

```bash
cd equilibra-front
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o ambiente de desenvolvimento

```bash
npm run dev
```

Após iniciar o servidor, acesse no navegador o endereço local informado pelo Vite no terminal.

### Outros comandos
| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Verifica os tipos TypeScript e gera a versão de produção. |
| `npm run lint` | Executa a análise estática do código. |
| `npm run preview` | Permite visualizar localmente a versão de produção gerada. |

## Estrutura do projeto
```text
src/
├── assets/       # Imagens, logo e recursos visuais
├── components/   # Componentes reutilizáveis
├── pages/
│   ├── admin/    # Área administrativa
│   ├── app/      # Módulos da plataforma
│   ├── auth/     # Autenticação e cadastro
│   ├── landing/  # Página inicial
│   └── legal/    # Termos de uso e privacidade
├── App.tsx       # Rotas da aplicação
└── main.tsx      # Inicialização do front-end
```

## Ambiente de produção

A aplicação está publicada na Vercel:
**[Acesse o Equilibra](https://equilibra-plataforma.vercel.app/)**

O Frontend integra-se aos serviços de Backend da plataforma para viabilizar os recursos que dependem de dados e processamento externos.

---

<p align="center">
  <strong>Equilibra</strong><br />
  Mais segurança para estar em movimento.
</p>
