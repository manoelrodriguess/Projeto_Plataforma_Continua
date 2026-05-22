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
pnpm install
```

Inicie o ambiente de desenvolvimento:

```
pnpm run dev
```

Por padrao, o Vite inicia em `http://localhost:3000` ou na proxima porta disponivel.

## Scripts

- `pnpm run dev`: inicia o frontend com Vite.
- `pnpm run build`: gera o build do frontend e compila o backend.
- `pnpm run start`: executa a aplicacao em modo de producao.
- `pnpm run preview`: visualiza o build do frontend localmente.
- `pnpm run check`: verifica os tipos TypeScript.
- `pnpm run format`: formata o codigo com Prettier.

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
