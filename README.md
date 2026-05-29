# InnovaGov

Aplicacao web moderna para gestao e inovacao governamental.

## Pre-requisitos

Antes de comecar, instale:

- **Node.js** versao 16 ou superior
- **pnpm** como gerenciador de pacotes

Se nao tiver o pnpm instalado:

```
npm install -g pnpm
```

## Como rodar
Instale as dependencias:

```
npm install --legacy-peer-deps
```

Inicie o ambiente de desenvolvimento:

```
npm run dev
```

Por padrao, o Vite inicia em `http://localhost:3000` ou na proxima porta disponivel.

## Scripts

- `npm run dev`: inicia o frontend com Vite, igual ao ambiente local atual.
- `npm run dev:frontend`: inicia apenas o frontend com Vite.
- `npm run dev:backend`: inicia apenas o backend Express.
- `npm run build`: gera o build estatico do frontend em `dist/public`.
- `npm run build:full`: gera o build completo, frontend e backend.
- `npm run build:frontend`: gera apenas o build estatico do frontend em `dist/public`.
- `npm run build:backend`: compila apenas o backend Express em `dist`.
- `npm run start`: executa o backend compilado em modo de producao.
- `npm run preview`: visualiza o build do frontend localmente.
- `npm run check`: verifica os tipos TypeScript.
- `npm run format`: formata o codigo com Prettier.

## Deploy

Use a Vercel para publicar o frontend estatico:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist/public`
- Install command: `npm install --legacy-peer-deps`
- Root directory: raiz do repositorio

O arquivo `vercel.json` ja deixa essas configuracoes no repositorio e tambem redireciona as rotas do app para `index.html`.

Observacao: hoje o backend Express fica apenas como base para uma evolucao futura. Como o prototipo nao consome API de negocio, nao e necessario publicar no Render agora. Quando forem criadas rotas de API, o frontend pode chamar a URL do backend por uma variavel como `VITE_API_URL`.

## Estrutura

```text
InnovaGov/
|-- apps/
|   |-- frontend/             # Aplicacao web React + Vite
|   |   |-- index.html
|   |   |-- public/           # Arquivos estaticos
|   |   `-- src/
|   |       |-- components/   # Componentes React
|   |       |-- contexts/     # Contextos React
|   |       |-- hooks/        # Hooks customizados
|   |       |-- lib/          # Utilitarios do frontend
|   |       |-- pages/        # Paginas da aplicacao
|   |       |-- App.tsx
|   |       `-- main.tsx
|   `-- backend/              # Servidor Node.js + Express
|       `-- index.ts
|-- packages/
|   `-- shared/               # Codigo compartilhado entre frontend e backend
|-- patches/                  # Patches de dependencias pnpm
|-- package.json              # Scripts e dependencias
|-- tsconfig.json             # Configuracao TypeScript
|-- vite.config.ts            # Configuracao Vite
`-- pnpm-lock.yaml
```

## Tecnologias

- **Linguagem principal:** TypeScript
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Componentes UI:** Radix UI
- **Build:** Vite e TypeScript Compiler
- **Pacotes:** pnpm

## Variaveis de ambiente

Se precisar configurar variaveis locais, crie um arquivo `.env.local` na raiz do projeto.

## Observacao sobre o backend

O backend atual serve os arquivos estaticos gerados pelo frontend em producao e redireciona rotas para o `index.html`. Ele ainda nao possui uma API de negocio separada.
