
# 3. Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="2-Planejamento-Projeto.md"> Planejamento do Projeto do Software (Cronograma) </a></span>

> Nesta seção, você vai detalhar os requisitos do seu sistema e as restrições do projeto, organizando as funcionalidades e características que a solução deve ter.

---

## 3.1 Requisitos Funcionais

Preencha o Quadro abaixo com os requisitos funcionais que **detalham as funcionalidades que seu sistema deverá oferecer**.  
Cada requisito deve representar uma característica única da solução e ser claro para orientar o desenvolvimento.


|ID     | Descrição do Requisito                                                                                          | Prioridade |
|-------|-----------------------------------------------------------------------------------------------------------------|------------|
|RF-01  | O sistema deve permitir o cadastro, edição e exclusão de peças de roupa, incluindo tamanho, estado de conservação e origem (doação ou venda).                                                                                                        | ALTA       | 
|RF-02  | O sistema deve registrar automaticamente a entrada de doações e a saída de peças distribuídas ou vendidas beneficientemente, atualizando o estoque em tempo real.                                                                                      | ALTA       |
|RF-03  | O sistema deve disponibilizar um catálogo digital atualizado das peças em estoque, acessível para clientes e voluntários, contendo informações como tamanho, estado de conservação, origem, fotos e preço (quando aplicável).                       | ALTA       |
|RF-04  | O sistema deve permitir relatórios de acompanhamento de impacto social, mostrando número de peças arrecadadas, distribuídas e vendidas beneficentemente.                                                                                                | MÉDIA      |
|RF-05  | O sistema deve permitir registrar observações ou notas sobre cada peça, como defeitos e/ou particularidades.    | BAIXA      |
|RF-06  | O sistema deve permitir anexar fotos às peças de roupa para facilitar identificação e controle visual.          | ALTA       |
|RF-07  | O sistema deve controlar peças reservadas para distribuição ou venda beneficente.                               | MÉDIA      |
|RF-08  | O sistema deve permitir exportação de relatórios em formato simples para acompanhamento externo.                | MÉDIA      |

---

## 3.2 Histórias de Usuário

**História 1 (relacionada ao Requisito RF-01):**
Como voluntário, eu quero cadastrar novas peças de roupa informando tamanho, estado de conservação e origem, para que elas fiquem disponíveis no controle do estoque.

**História 2 (relacionada ao Requisito RF-02):**
Como administrador, eu quero que o sistema registre automaticamente doações recebidas e peças distribuídas/vendidas, para que o estoque seja atualizado em tempo real sem necessidade de ajustes manuais.

**História 3 (relacionada ao Requisito RF-03):**
Como cliente ou voluntário, eu quero visualizar um catálogo digital atualizado com todas as peças disponíveis, contendo informações detalhadas e fotos, para escolher as roupas que preciso.

**História 4 (relacionada ao Requisito RF-04):**
Como administrador, eu quero gerar relatórios de impacto social mostrando peças arrecadadas, distribuídas e vendidas, para acompanhar os resultados do projeto.

**História 5 (relacionada ao Requisito RF-05):**
Como voluntário, eu quero adicionar observações específicas sobre cada peça (como defeitos ou particularidades), para que outros usuários tenham informações completas sobre o item.

**História 6 (relacionada ao Requisito RF-06):**
Como voluntário, eu quero anexar fotos às peças durante o cadastro, para facilitar a identificação visual no catálogo e evitar confusões.

**História 7 (relacionada ao Requisito RF-07):**
Como voluntário, eu quero marcar peças como reservadas para distribuição ou venda beneficente, para controlar temporariamente sua disponibilidade no estoque.

**História 8 (relacionada ao Requisito RF-08):**
Como administrador, eu quero exportar relatórios em formato simples, para compartilhar informações de acompanhamento com parceiros e apoiadores.

</div>

---

## 3.3 Requisitos Não Funcionais

Preencha o Quadro abaixo com os requisitos não funcionais que definem **características desejadas para o sistema que irão desenvolver**, como desempenho, segurança, usabilidade, etc.  
> Lembre-se que esses requisitos são importantes para garantir a qualidade da solução.

|ID     | Descrição do Requisito                                                                              |Prioridade |
|-------|-----------------------------------------------------------------------------------------------------|-----------|
|RNF-01 | O sistema deve ser intuitivo, com tempo de aprendizado não superior a 15 minutos para voluntários com conhecimentos básicos de tecnologia.  | ALTA     | 
|RNF-02 | O sistema deve manter a consistência dos dados de estoque em tempo real, garantindo que não haja discrepâncias entre entrada e saída de peças. | ALTA      | 
|RNF-03 | O aplicativo deve responder às ações do usuário em menos de 2 segundos para operações críticas (cadastro, consulta de estoque). | ALTA  |
|RNF-04 | Os dados devem ser armazenados de forma segura no dispositivo, com proteção contra acesso não autorizado. | ALTA |
|RNF-05 | O aplicativo deve ser desenvolvido em Expo React Native, compatível com as versões estáveis mais recentes do Expo Go e funcionando adequadamente nas versões iOS e Android mais comuns no mercado. | ALTA  |
|RNF-06 | O aplicativo deve gerenciar eficientemente o espaço de armazenamento, especialmente considerando o armazenamento de imagens das peças.| MÉDIA  |
|RNF-07 | O código deve ser organizado e documentado para facilitar sua manutenibilidade. | MÉDIA  |
|RNF-08 | O sistema deve suportar o cadastro de até 200 peças sem degradação significativa de performance.| BAIXA  |
|RNF-09 | A interface deve permitir customizações básicas como logotipo do brechó e cores institucionais.| BAIXA  |
|RNF-10  | O sistema deve possuir um layout intuitivo e simples, facilitando o uso dos voluntários e gestão do brechó.     | ALTA       |
---

## 3.4 Restrições do Projeto

> Restrições são limitações externas impostas ao projeto que devem ser rigorosamente obedecidas durante o desenvolvimento. Elas podem estar relacionadas a prazos, tecnologias obrigatórias ou proibidas, ambiente de execução, normas legais ou políticas internas da organização. Diferente dos requisitos não funcionais, que indicam características desejadas do sistema, as restrições determinam limites fixos que influenciam as decisões de projeto.

O Quadro abaixo deve ser preenchida com as restrições específicas que **impactam seu projeto**. Caso não haja alguma restrição adicional além das já listadas, mantenha a tabela conforme está.

| ID  | Restrição                                                              |
|------|-----------------------------------------------------------------------|
| R-01   | O backend do sistema deverá ser inteiramente gerenciado pelo Firebase, sem necessidade de servidor adicional.           |
| R-02   | Não será permitido o uso de dados sensíveis de usuários sem consentimento explícito, em conformidade com a LGPD (Lei Geral de Proteção de Dados).  |
| R-03   | O sistema deverá exibir mensagens de erro e sucesso em português do Brasil, seguindo padrão de linguagem simples e inclusiva.                |
| R-04   | O software deverá ser compatível com dispositivos móveis Android e iOS.                     |
| R-05   | Somente usuários autenticados poderão registrar doações, vendas, saídas ou gerar relatórios.                   |
| R-06   | O sistema deverá armazenar no máximo 200 peças simultaneamente, mantendo desempenho adequado.           |
| R-07   | O aplicativo não poderá utilizar bibliotecas pagas ou dependências com licença comercial restrita.                |
| R-08   | O projeto não poderá utilizar APIs externas que exijam autenticação paga ou assinatura mensal.                |

---
## 3.5 Regras de Negócio

### Fluxo de Doações (Entradas e Saídas)

- **RB01 – Doação Recebida (Entrada de Estoque)**  
  Se o brechó receber uma doação, então os itens devem ser adicionados ao estoque vinculados ao cadastro do doador (ou como “Doador Anônimo” se não identificado).  

- **RB02 – Doação Realizada (Saída de Estoque)**  
  Se o brechó realizar uma doação, então os itens devem ser retirados do estoque e vinculados ao cadastro do beneficiário (ou como “Beneficiário Anônimo” se não identificado).  

- **RB03 – Registro de Origem e Destino**  
  Se houver movimentação de doação (entrada ou saída), então o sistema deve armazenar obrigatoriamente a **origem** (quem doou) ou o **destino** (quem recebeu).  

- **RB04 – Estoque por Movimentação**  
  Se houver entrada por doação, então o sistema deve somar a quantidade no estoque.  
  Se houver saída por doação, então o sistema deve subtrair a quantidade no estoque.  

- **RB05 – Relatórios de Doações**  
  Se um relatório de doações for gerado, então ele deve apresentar separadamente:  
  - Entradas → Doações recebidas (com data, doador e quantidade).  
  - Saídas → Doações realizadas (com data, beneficiário e quantidade).  

- **RB06 – Doações Avulsas**  
  Se a doação recebida ou realizada não tiver identificação, então o sistema deve registrar como **Anônimo** no campo de origem/destino.  

---

### Fluxo de Vendas

- **RB07 – Saída de Estoque por Venda**  
  Se um pedido de venda for concluído, então o sistema deve dar baixa no estoque de acordo com os itens vendidos.  

- **RB08 – Cadastro de Pedido**  
  Se um pedido for iniciado, então ele só poderá ser finalizado se houver produtos disponíveis em estoque.  

- **RB09 – Vendas vs Doações**  
  Se um item sair do estoque, então o sistema deve classificar a saída como **Venda** ou **Doação**, de forma que os relatórios consigam distinguir ambos os casos.  

---

### Clientes, Beneficiários e Doadores/Fornecedores

- **RB10 – Cadastro de Doadores/Fornecedores**  
  Se um doador/fornecedor for cadastrado, então o sistema deve permitir registrar dados básicos (nome, telefone, e-mail, observações), mas não deve ser obrigatório para doações avulsas.  

- **RB11 – Cadastro de Clientes/Beneficiários**  
  Se um cliente ou beneficiário for cadastrado, então o sistema deve permitir registrar dados básicos, mas também aceitar cadastros simples (somente nome ou até anônimo).  

- **RB12 – Vínculo nas Movimentações**  
  Se uma movimentação de doação for registrada, então ela deve estar vinculada a um doador (entrada) ou a um beneficiário (saída).  

- **RB13 – Relatórios de Doadores/Fornecedores**  
  Se um relatório de doações recebidas for gerado, então o sistema deve permitir filtrar por doador/fornecedor para identificar quem mais colabora com o brechó.  

- **RB14 – Relatórios de Beneficiários**  
  Se um relatório de doações realizadas for gerado, então o sistema deve permitir filtrar por beneficiário para identificar quantas vezes e quantos itens foram repassados.  

- **RB15 – Histórico de Relacionamento**  
  Se um doador/fornecedor ou cliente/beneficiário tiver movimentações registradas, então o sistema deve exibir um histórico completo das doações/vendas vinculadas a ele.  

---

### Regras Gerais do Sistema

- **RB16 – Relatórios de Estoque**  
  Se um relatório de estoque for gerado, então ele deve apresentar separadamente as entradas por doação e por compra, bem como as saídas por venda e por doação.  

- **RB17 – Regras de Autenticação**  
  Se o usuário não estiver autenticado no sistema, então ele não poderá registrar doações, vendas, saídas ou acessar relatórios.  

- **RB18 – Exclusão de Registros**  
  Se uma doação, pedido ou cliente já tiver movimentações vinculadas (ex.: baixa de estoque), então não poderá ser excluído, apenas inativado.  

---

### Tabela Resumo de Regras de Negócio

A tabela abaixo apresenta de forma resumida as regras que **impactam diretamente o projeto**.

| ID     | Regra de Negócio                                                                 | Impacto/Motivo |
|--------|----------------------------------------------------------------------------------|----------------|
| RN-01  | Se uma doação for recebida, então os itens devem ser adicionados ao estoque e vinculados ao doador ou marcados como anônimos. | Garante rastreabilidade das entradas e mantém o estoque atualizado. |
| RN-02  | Se uma doação for realizada, então os itens correspondentes devem ser retirados do estoque e vinculados ao beneficiário ou marcados como anônimos. | Controla corretamente as saídas de estoque e garante histórico de beneficiados. |
| RN-03  | Se houver movimentação de doação, então a origem (doador) ou destino (beneficiário) deve ser registrada. | Evita inconsistências e assegura rastreabilidade. |
| RN-04  | Se houver movimentação de entrada, então o estoque deve ser incrementado; se houver movimentação de saída, então o estoque deve ser decrementado.      | Mantém o saldo de estoque correto. |
| RN-05  | Se um relatório de doações for gerado, então deve separar claramente entradas (recebidas) de saídas (realizadas). | Facilita a análise e prestação de contas. |
| RN-06  | Se uma doação avulsa for registrada, então pode ser classificada como "Anônimo".                            | Flexibilidade para doações sem identificação. |
| RN-07  | Se uma venda for concluída, então deve gerar baixa automática no estoque dos itens vendidos.                           | Evita divergências entre estoque e vendas. |
| RN-08  | Se um pedido de venda for finalizado, então só pode ser processado se houver estoque disponível para todos os itens.                 | Impede vendas acima da quantidade real. |
| RN-09  | Se ocorrer uma saída de estoque, então deve ser classificada como Venda ou Doação.        | Permite relatórios distintos entre vendas e doações. |
| RN-10  | Se um doador/fornecedor for cadastrado, então deve permitir dados básicos, mas não é obrigatório o preenchimento completo. | Facilita cadastro sem burocracia, mas permite detalhamento quando necessário. |
| RN-11  | Se um cliente/beneficiário for cadastrado, então pode ser registrado com dados simples (nome) ou como anônimo.           | Garante inclusão de beneficiários sem exigir dados complexos. |
| RN-12  |	Se ocorrer uma movimentação de doação, então deve estar obrigatoriamente vinculada a um doador (entrada) ou beneficiário (saída). | Garante consistência nas operações. |
| RN-13  | 	Se um relatório de doações recebidas for gerado, então deve permitir filtro por doador/fornecedor.       | Permite identificar os maiores colaboradores. |
| RN-14  | Se um relatório de doações realizadas for gerado, então deve permitir filtro por beneficiário.           | Permite identificar o impacto social do brechó. |
| RN-15  | 	Se ocorrer qualquer movimentação, então o sistema deve manter histórico completo vinculado ao doador ou beneficiário. | Facilita controle e transparência no relacionamento. |
| RN-16  | Se um relatório de estoque for gerado, então deve exibir entradas e saídas separadas por tipo de movimentação.         | Oferece visão clara da movimentação de estoque. |
| RN-17  | Se um usuário não estiver autenticado, então não pode registrar doações, vendas ou acessar relatórios. | Garante segurança e evita uso indevido. |
| RN-18  | Se um registro tiver movimentações vinculadas, então não pode ser excluído, apenas inativado. | Mantém integridade histórica dos dados. |
