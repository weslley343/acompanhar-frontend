<!-- BEGIN:nextjs-agent-rules -->
# Agent Rules — Projeto Next.js

Este projeto implementa uma plataforma web voltada ao acompanhamento de pacientes dentro do espectro autista, utilizando um sistema de recomendação baseado em dados provenientes das escalas CARS-BR, ICA e ATEC. O objetivo é fornecer aos profissionais de saúde insights comparativos e sugestões de melhorias derivadas de pacientes semelhantes, reduzindo subjetividade na avaliação, auxiliando na interpretação dos resultados ao longo do tempo e oferecendo suporte clínico baseado em evidências.

A aplicação funciona a partir de quatro pilares centrais:

1. **Registro estruturado de avaliações**  
   Profissionais inserem dados das escalas conforme protocolos padronizados. A aplicação mantém consistência, segurança e suporte à evolução longitudinal.

2. **Sistemas de recomendação aplicados ao contexto clínico**  
   Perfis avaliados são comparados a uma base populacional simulada (mock inicial de 50 usuários e mock ampliado de 5.000 usuários) para identificar padrões e gerar recomendações com base em similaridade. Técnicas utilizadas incluem distância euclidiana e métodos adicionais destinados a reduzir a partida a frio e aumentar a precisão.

3. **Visualização clara e responsiva dos resultados**  
   O front-end em Next.js prioriza mobile first, transições suaves, leitura fácil e apresentação visual intuitiva de gráficos, evoluções e recomendações. Deve ser simples para profissionais entenderem rapidamente o que a análise de dados revela.

O agente deve sempre considerar que esta aplicação é um suporte clínico orientado por dados, não um diagnóstico médico, e que suas respostas, códigos ou sugestões devem manter coerência com este propósito central.

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


## SCHEMA

  - nossa aplicação tem o seguinte schema
  // schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model system_logs {
  id         Int      @id @default(autoincrement())
  message    String   @db.VarChar(255)
  level      String   @db.VarChar(50) // info, warning, error
  context    Json?
  created_at DateTime @default(now()) @db.Timestamp(6)
}

model admins {
  id         Int      @id @default(autoincrement())
  name       String   @db.VarChar(255)
  email      String   @unique @db.VarChar(255)
  password   String   @db.VarChar(255)
  created_at DateTime      @default(now()) @db.Timestamp(6)
  updated_at DateTime      @updatedAt @db.Timestamp(6)
  suggestions suggestions[]
}

model answers {
  id            Int         @id @default(autoincrement())
  evaluation_fk Int
  question_fk   Int
  item_fk       Int
  created_at    DateTime?   @default(now()) @db.Timestamp(6)
  evaluations   evaluations @relation(fields: [evaluation_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
  itens         itens       @relation(fields: [item_fk], references: [id], onDelete: NoAction, onUpdate: NoAction)
  questions     questions   @relation(fields: [question_fk], references: [id], onDelete: NoAction, onUpdate: NoAction)
}

model evaluations {
  id              Int           @id @default(autoincrement())
  title           String        @db.VarChar(100)
  notes           String?       @db.VarChar(255)
  client_fk       String        @db.Uuid
  professional_fk String        @db.Uuid
  scale_fk        Int
  metadata        Json?
  created_at      DateTime?     @default(now()) @db.Timestamp(6)
  answers         answers[]
  clients         clients       @relation(fields: [client_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
  professionals   professionals @relation(fields: [professional_fk], references: [id], onDelete: NoAction, onUpdate: NoAction)
  scales          scales        @relation(fields: [scale_fk], references: [id], onDelete: NoAction, onUpdate: NoAction)
}

model client_professional {
  id String @id @default(uuid()) @db.Uuid

  client_fk       String        @db.Uuid
  professional_fk String        @db.Uuid
  archived        Boolean?      @default(false)
  created_at      DateTime?     @default(now()) @db.Timestamp(6)
  clients         clients       @relation(fields: [client_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
  professionals   professionals @relation(fields: [professional_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
}

model client_responsible {
  id String @id @default(uuid()) @db.Uuid

  client_fk      String       @db.Uuid
  responsible_fk String       @db.Uuid
  archived       Boolean?     @default(false)
  created_at     DateTime?    @default(now()) @db.Timestamp(6)
  clients        clients      @relation(fields: [client_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
  responsibles   responsibles @relation(fields: [responsible_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
}

model clients {
  id String @id @default(uuid()) @db.Uuid

  image_url           String?               @db.VarChar(100)
  identifier          String                @unique @db.VarChar(30)
  code                String?               @db.VarChar(7)
  full_name           String                @db.VarChar
  birthdate           DateTime?             @db.Date
  gender              gender_enum?
  description         String?               @db.VarChar(100)
  creator_fk          String?               @db.Uuid
  created_at          DateTime?             @default(now()) @db.Timestamp(6)
  evaluations         evaluations[]
  client_professional client_professional[]
  client_responsible  client_responsible[]
  responsibles        responsibles?         @relation(fields: [creator_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
}

model itens {
  id          Int       @id @default(autoincrement())
  item_order  Int
  content     String    @db.VarChar
  score       Decimal?  @db.Decimal(3, 1)
  question_fk Int
  created_at  DateTime? @default(now()) @db.Timestamp(6)
  answers     answers[]
  questions   questions @relation(fields: [question_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
}

model professionals {
  id String @id @default(uuid()) @db.Uuid

  identifier          String                @unique @db.VarChar(30)
  full_name           String                @db.VarChar
  image_url           String?               @db.VarChar
  password            String                @db.VarChar
  description         String?               @db.VarChar(100)
  email               String                @unique @db.VarChar
  specialty           String                @db.VarChar
  created_at          DateTime?             @default(now()) @db.Timestamp(6)
  evaluations         evaluations[]
  client_professional client_professional[]
  suggestions         suggestions[]
}

model questions {
  id         Int       @id @default(autoincrement())
  item_order Int
  content    String    @db.VarChar
  scale_fk   Int
  domain     String    @db.VarChar
  color      String?   @default("#FFFFFF")
  created_at DateTime? @default(now()) @db.Timestamp(6)
  answers    answers[]
  itens      itens[]
  scales     scales    @relation(fields: [scale_fk], references: [id], onDelete: Cascade, onUpdate: NoAction)
}

model responsibles {
  id String @id @default(uuid()) @db.Uuid
  identifier         String               @unique @db.VarChar(30)
  full_name          String               @db.VarChar
  image_url          String?              @db.VarChar
  password           String               @db.VarChar
  description        String?              @db.VarChar(100)
  email              String               @unique @db.VarChar
  created_at         DateTime?            @default(now()) @db.Timestamp(6)
  client_responsible client_responsible[]
  clients            clients[]
  suggestions        suggestions[]
}

model scales {
  id          Int           @id @default(autoincrement())
  name        String        @unique @db.VarChar(100)
  image_url   String?       @db.VarChar
  description String        @db.VarChar(255)
  color       String?       @default("#FFFFFF")
  created_at  DateTime?     @default(now()) @db.Timestamp(6)
  evaluations evaluations[]
  questions   questions[]
}

enum suggestion_status_enum {
  pending
  responded
}

enum gender_enum {
  male
  female
  unspecified
}

model suggestions {
  id             Int                    @id @default(autoincrement())
  content        String                 @db.Text
  response       String?                @db.Text
  status         suggestion_status_enum @default(pending)
  
  professional_fk String?               @db.Uuid
  responsible_fk  String?               @db.Uuid
  admin_fk        Int?                  
  
  created_at      DateTime              @default(now()) @db.Timestamp(6)
  updated_at      DateTime              @updatedAt @db.Timestamp(6)

  professionals   professionals?        @relation(fields: [professional_fk], references: [id], onDelete: SetNull)
  responsibles    responsibles?         @relation(fields: [responsible_fk], references: [id], onDelete: SetNull)
  admins          admins?               @relation(fields: [admin_fk], references: [id], onDelete: SetNull)
}



<!-- END:nextjs-agent-rules -->