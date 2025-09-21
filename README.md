# Dona Zulmira — Front-End

Este repositório contém a interface web do sistema Casa Dona Zulmira, desenvolvido para gerenciamento de moradores, profissionais, medicamentos, relatórios e usuários de uma instituição de acolhimento. O front-end foi construído com **TypeScript** e **React** (Next.js), focando em usabilidade, integração com backend e visual limpo.

---

## 📋 Funcionalidades Principais

- **Autenticação:** Tela de login para usuários autorizados.
- **Gestão de Moradores:** Cadastro, listagem, edição, evolução individual, prescrição de medicamentos e perfil detalhado.
- **Gestão de Usuários:** Cadastro, listagem e administração de permissões.
- **Gestão de Profissionais:** Cadastro e listagem de médicos.
- **Gestão de Medicamentos:** Cadastro e listagem de medicamentos.
- **Relatórios Diários Gerais:** Cadastro, visualização e edição de relatórios do dia a dia da instituição.
- **Navegação Lateral:** Menu lateral responsivo com navegação entre as principais seções.
- **Identidade Visual:** Logotipo da Casa Dona Zulmira em destaque nas páginas, fonte Poppins, cores institucionais.

---

## 🗂️ Estrutura de Pastas

- **`src/app/`**
  - `morador/`, `moradores/`: Listagem, perfil, cadastro e evolução dos moradores.
  - `usuarios/`: Listagem e administração de usuários do sistema.
  - `medicos/`, `medicamentos/`: Gestão de médicos e medicamentos.
  - `relatoriodiariogeral/`: Relatórios diários gerais da casa.
  - `login/`: Tela de autenticação.
  - `cad-morador/`: Cadastro de novos moradores.
- **`src/components/`**
  - `HeaderBrand.tsx`: Componente de cabeçalho com logo e título institucional.
  - `forms/usuario-form.tsx`: Formulário de cadastro/edição de usuário.
  - `ui/`: Componentes de interface reutilizáveis (Input, Button, Label, Switch, etc).

---

## 🚀 Como Executar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/AsheleyNascimento/Dona-Zulmira--Front-End.git
   cd Dona-Zulmira--Front-End
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Execute o projeto em modo desenvolvimento:**
   ```bash
   npm run dev
   ```
   O sistema estará disponível em `http://localhost:3000`.

---

## 🧩 Dependências Principais

- **React / Next.js:** Estrutura SPA e SSR.
- **TypeScript:** Tipagem estática.
- **Lucide-React:** Ícones.
- **Google Fonts (Poppins):** Tipografia institucional.
- **Outras:** Dependências para UI e formulários podem ser verificadas no `package.json`.

---

## 🎨 Visual & Usabilidade

- Layout com cores institucionais (azul, branco, cinza claro).
- Sidebar com logo e navegação clara.
- Componentização para reuso e padronização visual.
- Responsividade para diferentes tamanhos de tela.

---

## 👤 Autor

- [AsheleyNascimento](https://github.com/AsheleyNascimento)

---

## 📄 Licença

Este projeto está sob licença privada. Para uso, solicite autorização ao autor.

---

**Contribuições são bem-vindas! Sinta-se livre para sugerir melhorias e reportar problemas.**
