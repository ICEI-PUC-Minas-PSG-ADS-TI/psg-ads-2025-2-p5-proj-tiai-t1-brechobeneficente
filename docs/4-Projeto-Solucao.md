# 4. Projeto da Solução

<span style="color:red">Pré-requisitos: <a href="03-Modelagem do Processo de Negocio.md"> Modelagem do Processo de Negocio</a></span>

---
**ARQUITETURA DO SOFTWARE**
## 4.1. Arquitetura da Solução

A arquitetura da solução segue o modelo cliente → BaaS (Backend as a Service), utilizando React Native no desenvolvimento do aplicativo mobile e Firebase como provedor de serviços backend, garantindo simplicidade, escalabilidade e baixo custo de manutenção.

**Organização dos Componentes**

A solução é composta por três principais camadas/componentes:

**1. Dispositivo Móvel**

Representa o ambiente onde o aplicativo é executado (celulares Android ou iOS).

O usuário interage com o app através de uma interface intuitiva desenvolvida em React Native.

Todas as ações do usuário (cadastro, consulta, atualização, exclusão de dados) são processadas pelo aplicativo, que se comunica diretamente com o Firebase por meio da internet.

**2. Aplicativo Mobile (React Native + Expo)**

Desenvolvido com React Native e gerenciado pelo Expo, o aplicativo oferece uma experiência fluida e multiplataforma.
Dentro do app existem módulos internos que organizam as funcionalidades principais:

Módulos Internos:

- Cadastro de Doadores: permite registrar informações sobre pessoas que doam itens.

- Cadastro de Clientes: armazena os dados de pessoas que recebem ou compram os itens.

- Cadastro de Itens Doado: controla os produtos recebidos, incluindo descrição, categoria, quantidade e imagens.

- Relatórios e Estoque: gera visualizações e resumos das doações, movimentações e estoque disponível.

Toda a lógica de interface e parte das validações de dados são executadas no próprio app, que envia e recebe informações do Firebase.

**3. Firebase (Backend as a Service - BaaS)**

O Firebase é responsável por toda a infraestrutura de backend, oferecendo serviços prontos para autenticação, banco de dados e armazenamento.

Os principais serviços utilizados:

Firebase Authentication:
responsável por gerenciar o registro e login de usuários, permitindo autenticação por e-mail e senha.
Garante a segurança dos acessos e protege as rotas internas do app.

Firebase Firestore (Realtime Database):
armazena todas informações do sistema, como dados de doadores, clientes, itens e transações.
O Firestore é um banco de dados NoSQL em nuvem que permite leitura e escrita em tempo real, facilitando a sincronização automática entre os dispositivos conectados.

Firebase Storage:
responsável pelo armazenamento de imagens dos itens doados.
As imagens são enviadas diretamente do app e associadas aos registros do banco de dados.

Comunicação entre os Módulos:

A comunicação entre os componentes ocorre de forma direta e segura via SDKs oficiais do Firebase para React Native. Tendo o seguinte fluxo:

- O usuário interage com o aplicativo mobile em seu dispositivo;

- O aplicativo, por meio de funções assíncronas e chamadas às APIs do Firebase, envia e recebe dados via Internet;

- O Firebase processa as solicitações e retorna os resultados (autenticação, dados, imagens);

- O app exibe as informações atualizadas para o usuário, sem necessidade de um backend intermediário.

Essa arquitetura elimina a necessidade de um servidor próprio, pois o Firebase centraliza toda a parte de backend (autenticação, banco de dados e storage), enquanto o React Native concentra a interface e a lógica de interação do usuário.

Diagrama:
 <img width="1536" height="1024" alt="arquitetura2" src="https://github.com/user-attachments/assets/ca340d28-ac73-4598-ba4c-145c2782ea02" />
 
---
**MODELAGEM VISUAL DAS TELAS**

## 4.2. Wireframe / Mockup
**Wireframe 1 — Tela login/cadastro**  
<img width="752" height="376" alt="image" src="https://github.com/user-attachments/assets/3e4d20fe-f54a-4885-ae3d-08ac20082759" />


**Wireframe 2 — Telas principais**  
<img width="785" height="534" alt="image" src="https://github.com/user-attachments/assets/61872692-ddfd-4a4c-89b9-335be45992c9" />
<img width="777" height="532" alt="image" src="https://github.com/user-attachments/assets/c3bf7461-f334-437f-b7e4-015aff5e0854" />
<img width="767" height="532" alt="image" src="https://github.com/user-attachments/assets/9a1dec41-2b70-4057-8aa2-0438650de4cb" />


**Wireframe 3 — Telas de Relatórios**  
<img width="777" height="620" alt="image" src="https://github.com/user-attachments/assets/a60e0fe4-e67f-4b7e-bbe1-46fa485e6cf6" />
<img width="514" height="658" alt="image" src="https://github.com/user-attachments/assets/ef5b9a5b-1f5f-494f-8bdb-05777bce16b0" />

---
**UML**

## 4.3 Diagrama de Classes

O diagrama de classes ilustra graficamente como será a estrutura do software, e como cada uma das classes da sua estrutura estarão interligadas. Essas classes servem de modelo para materializar os objetos que executarão na memória.

<img width="571" height="895" alt="image" src="https://github.com/user-attachments/assets/f07e4073-5012-49ca-82df-04eb3b621a58" />

**BANCO DE DADOS**


---

### 4.4.2 Banco de Dados NoSQL

O projeto BrechóBeneficente utiliza o Firebase Firestore, um banco de dados NoSQL orientado a documentos.
As informações são organizadas em coleções, e cada coleção contém documentos representados em formato JSON, conforme mostrado a seguir.

#### 1. Modelo de Coleções / Documentos

*Os dados apresentados a seguir são simulados, uma vez que o desenvolvimento da aplicação ainda não foi iniciado. No Firebase Firestore, as coleções e documentos são criados dinamicamente por meio do código-fonte, de acordo com a interação do sistema com o banco de dados.*

O sistema possui as seguintes coleções principais:

```txt
clientes
estoque_historico
formas_pagamento
pedidos
produtos
usuarios
```
Cada coleção contém documentos com campos dinâmicos, criados automaticamente conforme os dados são gravados pela aplicação.
Por exemplo, a coleção pedidos armazena as vendas realizadas no brechó, com os seguintes campos:

| Campo               | Tipo      | Descrição                                    |
| ------------------- | --------- | -------------------------------------------- |
| **cliente**         | string    | Nome do comprador/beneficiario               |
| **created_at**      | timestamp | Data de criação do registro                  |
| **dataVenda**       | timestamp | Data e hora do pedido                        |
| **forma_pagamento** | string    | Meio de pagamento utilizado                  |
| **produto**         | string    | Nome do produto vendido                      |
| **quantidade**      | number    | Quantidade de itens vendidos                 |
| **status**          | string    | Situação da venda (ex: Concluída, Em aberto) |
| **valor**           | number    | Valor total da venda                         |


#### 2. Exemplos de Documentos / Registros

*Os documentos exibidos representam exemplos simulados de registros que serão gerados automaticamente pelo sistema durante o uso da aplicação. Como o Firebase cria as estruturas de forma dinâmica, ainda não há dados reais inseridos.*

```json
{
  "cliente": "Cliente teste",
  "created_at": "2025-06-23T00:42:52.596Z",
  "dataVenda": "2025-06-23T00:42:33.632Z",
  "forma_pagamento": "Dinheiro"
  "produto": "Camiseta",
  "quantidade": 5,
  "status": "Concluída",
  "valor": 30.00
}
```
#### 2. Exemplos de Documentos / Registros

*O script apresentado é ilustrativo e tem como objetivo demonstrar o funcionamento do processo de inserção de dados no Firestore. No momento, não há dados reais, pois a aplicação encontra-se em fase de modelagem e configuração inicial do banco.*

```javascript
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../services/firebase'

async function adicionarPedido(pedido) {
  try {
    const novoPedido = {
      cliente: pedido.cliente,
      produto: pedido.produto,
      quantidade: pedido.quantidade,
      valor: pedido.valor,
      status: pedido.status,
      forma_pagamento: pedido.forma_pagamento,
      pagamento: pedido.forma_pagamento,
      dataVenda: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, 'pedidos'), novoPedido)
    console.log('Pedido criado com ID:', docRef.id)
  } catch (e) {
    console.error('Erro ao adicionar pedido:', e)
  }
}
```
*Esse exemplo representa uma simulação do processo de inserção de um documento em uma coleção do Firebase Firestore. As coleções são criadas automaticamente no momento da inserção.*
