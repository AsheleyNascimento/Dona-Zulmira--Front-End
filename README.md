# Dona Zulmira — Front-End

Aplicação front-end do projeto "Dona Zulmira". Esta aplicação foi construída com Next.js e TypeScript e usa Tailwind CSS para estilização. O repositório contém os arquivos fonte em `src/` e ativos públicos em `public/`.

> Observação: este README é um ponto de partida. Adicione informações específicas do projeto (screenshots, links de demo, envs reais, detalhes de API) quando disponíveis.

## Índice
- [Demonstração](#demonstração)
- [Principais funcionalidades](#principais-funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts úteis](#scripts-úteis)
- [Deploy](#deploy)
- [Licença](#licença)
- [Contato](#contato)

## Demonstração
Insira aqui o link da demo (ex.: Vercel, Netlify) ou screenshots do projeto.

## Principais funcionalidades
- Interface responsiva construída com Next.js e Tailwind CSS.
- Estrutura baseada em TypeScript.
- Organização de código em `src/`.
- Configurações para linting (ESLint), PostCSS e Tailwind.

(Atualize esta lista com as funcionalidades reais do projeto.)

## Tecnologias
- Next.js (React + Server-Side Rendering / Static)
- TypeScript
- Tailwind CSS
- PostCSS
- ESLint
- PM2 (configuração presente no repositório para deploy/process manager)

## Pré-requisitos
- Node.js (recomendado LTS >= 18)
- npm ou yarn
- git

## Instalação e execução (desenvolvimento)
1. Clone o repositório:
   git clone https://github.com/AsheleyNascimento/Dona-Zulmira--Front-End.git
2. Entre na pasta do projeto:
   cd Dona-Zulmira--Front-End
3. Instale as dependências:
   npm install
   ou
   yarn
4. Inicie o servidor de desenvolvimento:
   npm run dev
   ou
   yarn dev
5. Abra no navegador:
   http://localhost:3000

## Build para produção
Gerar build:
npm run build
ou
yarn build

Executar build gerada:
npm start
ou
yarn start

(Se a aplicação usa um adaptador de produção/serve específico, ajuste conforme necessário.)

## Variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto e defina as variáveis necessárias. Exemplo:
NEXT_PUBLIC_API_URL=https://api.exemplo.com
OUTRA_VARIAVEL=valor

(Substitua pelas variáveis realmente usadas pela aplicação; verifique chamadas de fetch/axios no código.)

## Scripts úteis
- npm run dev — roda a aplicação em modo desenvolvimento
- npm run build — cria a versão de produção
- npm run start — serve a build de produção
- npm run lint — executa ESLint (se configurado)

(Confirme os scripts reais em `package.json` e atualize esta seção.)

## Deploy
Recomendações de deploy:
- Vercel: fácil integração com Next.js — conectar repositório e configurar variáveis de ambiente.
- Netlify: possível com builds estáticos ou adaptadores apropriados.
- Docker / PM2: o repositório inclui `ecosystem.config.js` — pode ser usado para executar a aplicação com PM2 em servidores.

## Licença
Defina a licença do projeto (ex.: MIT). Exemplo:
MIT © Nome do Autor

## Contato
Para dúvidas, entre em contato com o mantenedor: AsheleyNascimento (https://github.com/AsheleyNascimento)
