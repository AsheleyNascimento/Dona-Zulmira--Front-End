# Dona Zulmira — Front-End

## Introdução

Este repositório contém a interface web do sistema **Casa Dona Zulmira**. Desenvolvido para ser uma ferramenta completa de gerenciamento para instituições de acolhimento, o sistema abrange desde o acompanhamento de moradores até a gestão de profissionais e medicamentos.

O front-end foi construído com **TypeScript** e **React (Next.js)**, com foco em uma experiência de usuário intuitiva, integração robusta com o backend e um design limpo e funcional.

---

## 📋 Funcionalidades Principais

-   **Autenticação Segura:** Tela de login para acesso de usuários autorizados, com redirecionamento baseado na função (Administrador ou Cuidador).
-   **Gestão de Moradores Completa:**
    -   Cadastro, listagem e edição de perfis de moradores.
    -   Registro e acompanhamento da evolução individual de cada morador.
    -   Prescrição de medicamentos e visualização do histórico.
-   **Administração do Sistema (Acesso Restrito):**
    -   **Gestão de Usuários:** Cadastro, listagem e administração de permissões de acesso ao sistema.
    -   **Gestão de Profissionais:** Cadastro e listagem de médicos com seus respectivos CRMs.
    -   **Gestão de Medicamentos:** Cadastro e controle de medicamentos disponíveis.
-   **Relatórios Diários Gerais:**
    -   Cadastro, visualização e edição de relatórios diários da instituição.
    -   Funcionalidade de resumo com IA para otimizar o preenchimento das observações.
-   **Interface e Usabilidade:**
    -   **Navegação Intuitiva:** Menu lateral responsivo que facilita o acesso às principais seções.
    -   **Identidade Visual:** Componentes reutilizáveis que seguem a identidade da Casa Dona Zulmira, com o logotipo em destaque, a fonte Poppins e cores institucionais.
    -   **Componentes Reutilizáveis:** Utilização de `Card`, `Button`, `Input`, `Dialog` e outros componentes para garantir consistência visual e funcional.

---

## 🚀 Como Executar o Projeto

Para executar o projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos
-   Node.js (versão 18.18.0 ou superior)
-   npm ou Yarn

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/AsheleyNascimento/Dona-Zulmira--Front-End.git](https://github.com/AsheleyNascimento/Dona-Zulmira--Front-End.git)
    cd Dona-Zulmira--Front-End
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o projeto em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse a aplicação:**
    Abra seu navegador e acesse `http://localhost:3000`.

---

## 🗂️ Estrutura de Pastas

A estrutura do projeto foi organizada para facilitar a manutenção e escalabilidade:

-   **`src/app/`**: Contém todas as rotas e páginas da aplicação.
    -   `login/`: Tela de autenticação de usuários.
    -   `morador/`: Listagem e perfil detalhado dos moradores.
    -   `usuarios/`: Gestão de usuários do sistema.
    -   `medicos/`: Gestão de profissionais médicos.
    -   `medicamentos/`: Gestão de medicamentos.
    -   `relatoriodiariogeral/`: Seção para relatórios diários gerais.
-   **`src/components/`**: Componentes React reutilizáveis.
    -   `forms/`: Formulários para cadastro e edição (moradores, usuários, médicos, etc.).
    -   `ui/`: Componentes de interface genéricos (shadcn/ui), como `Button`, `Card`, `Input`, `Dialog`, etc..
    -   `HeaderBrand.tsx`: Componente de cabeçalho padrão com a identidade visual.
-   **`src/lib/`**: Funções utilitárias e de integração.
    -   `api.ts`: Centraliza todas as chamadas à API do backend.
    -   `utils.ts`: Utilitários gerais, como a função `cn` para classes CSS.
-   **`src/types/`**: Definições de tipos TypeScript.
    -   `relatorio.ts`: Tipagens para relatórios, evoluções e prescrições.

---

## 🧩 Dependências Principais

-   **Framework:** [Next.js](https://nextjs.org/) (React)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/) (incluindo Radix UI)
-   **Ícones:** [Lucide React](https://lucide.dev/)

---

## 👤 Autor

-   **Asheley Nascimento**
-   **GitHub:** [@AsheleyNascimento](https://github.com/AsheleyNascimento)

---

## 📄 Licença

Este projeto está sob uma licença privada. Para utilizá-lo, por favor, solicite autorização ao autor.

---

**Contribuições são bem-vindas! Sinta-se à vontade para abrir *issues* e sugerir melhorias.**
