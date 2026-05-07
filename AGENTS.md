<!-- BEGIN:nextjs-agent-rules -->
# Agent Rules — Projeto Next.js

## ⚠️ Importante: Esta NÃO é a versão de Next.js que você conhece
Esta versão contém **breaking changes**.  
APIs, convenções, roteamento e a estrutura de arquivos **podem diferir do seu treinamento**.

Antes de gerar ou alterar qualquer código:
- Consulte a documentação localizada em `node_modules/next/dist/docs/`.
- Respeite avisos de deprecação e mensagens do compilador.
- Evite assumir comportamentos antigos de versões anteriores do Next.js.

---

## 🎨 Design System — Diretrizes para Interface
O projeto deve seguir um estilo consistente orientado por:

### **1. Mobile First**
- Layout inicial projetado para telas pequenas (360–430px).
- Componentes devem se adaptar naturalmente a breakpoints maiores.
- Conteúdo deve permanecer legível e tocar com conforto usando o polegar.

### **2. Responsividade Real**
- A interface deve se ajustar suavemente a:
  - Smartphones
  - Tablets
  - Notebooks
  - Monitores widescreen
- Evitar “saltos bruscos” entre breakpoints.
- Components fluídos com uso de `max-width`, `flex`, `grid` e `clamp()`.

### **3. Transições Suaves**
- Utilizar animações suaves, leves e não intrusivas.
- Preferir:
  - `opacity`
  - `transform`
- Evitar transições em:
  - `height`
  - `width`
  - `top`, `left`, `right`, `bottom`  
  (por causarem layout jank)
- Priorizar 60fps sempre que possível.

### **4. Arquitetura Visual**
- Usar espaçamentos consistentes (ex.: 4 / 8 / 12 / 16 / 24 / 32).
- Tipografia escalonada (`clamp()` recomendado).
- Paleta coerente com estados explícitos:
  - default
  - hover
  - focus
  - pressed
  - disabled
- Componentes reutilizáveis: botões, inputs, cards, avisos, skeletons etc.

---

## ⚙️ Boas Práticas para Geração de Código
Os agentes devem:

### **1. Seguir o novo roteamento e convenções do Next.js**
- Evitar referências a `pages/` se a versão utilizada adota `app/`.
- Consultar a documentação antes de criar rotas, hooks ou layouts.

### **2. Componentização e Reutilização**
- Criar componentes claros e isolados.
- Evitar duplicação de lógica.
- Manter estilos desacoplados da lógica quando possível.

### **3. Performance**
- Priorizar Server Components quando aplicável.
- Evitar carregamento desnecessário de dependências no cliente.
- Usar lazy loading para partes secundárias da UI.

### **4. Acessibilidade (A11y)**
- Todos os elementos interativos devem ter:
  - roles adequados
  - foco navegável
  - descrição acessível
- Preferir HTML semântico sobre divs anônimas.

---

## 🧪 Qualidade e Consistência
- Validar sempre a compatibilidade entre mobile e desktop.
- As animações devem ser consistentes em todo o sistema.
- As interfaces geradas devem seguir as regras acima de forma estrita.

<!-- END:nextjs-agent-rules -->