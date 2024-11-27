# 📈 INOA - Sistema de Monitoramento de Ativos

![Next.js](https://img.shields.io/badge/Next.js-13.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)
![Firebase](https://img.shields.io/badge/Firebase-11.0-orange)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991)


## 🚀 Sobre o Projeto

O INOA é uma plataforma moderna de monitoramento de ativos financeiros que permite aos usuários acompanhar seus investimentos em tempo real. Com uma interface intuitiva e recursos avançados, o sistema oferece uma experiência completa para investidores que desejam manter-se atualizados sobre suas carteiras.

### ✨ Principais Funcionalidades

### ✨ Principais Funcionalidades

- 💬 Chat Inteligente com IA
- 📊 Consulta de Mercado
- 💼 Gestão de Carteira
- 🎨 Interface Moderna

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - Next.js 14
  - TypeScript
  - TailwindCSS
  - Shadcn/ui
  - Recharts

- **Backend:**
  - Firebase Authentication
  - OpenAI API
  - Yahoo Finance API
  - MailerSend

- **Ferramentas de Desenvolvimento:**
  - ESLint
  - PostCSS
  - Prettier

## Estrutura do Projeto

```bash
.
├── app                    # Diretório principal do Next.js (App Router)
├── assets                 # Arquivos estáticos como imagens e ícones
├── components             # Componentes React reutilizáveis
├── components.json        # Configuração dos componentes shadcn/ui
├── constants              # Constantes e configurações globais
├── data                   # Arquivos de dados estáticos
├── emails                 # Templates de email
├── lib                    # Utilitários e funções auxiliares
├── public                 # Arquivos públicos acessíveis externamente
└── types                  # Definições de tipos TypeScript
```

## 🚀 Como Executar

1. Clone o repositório:

```bash
git clone git@github.com:jeancsamaral/csi-28.git
cd csi-28
```

2. Instale as dependências:
```bash
bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
bash
cp .env.example .env.local
```

4. Execute o projeto em desenvolvimento:
```bash
bash
npm run dev
```
