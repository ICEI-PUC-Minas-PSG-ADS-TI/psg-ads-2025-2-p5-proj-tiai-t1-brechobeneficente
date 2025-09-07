
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
|RF-03  | O sistema deve permitir a atualização e manutenção do catálogo digital de peças disponíveis para distribuição ou venda beneficiente.                                                                                                             | ALTA       |
|RF-04  | O sistema deve possuir um layout intuitivo e simples, facilitando o uso dos voluntários e gestão do brechó.     | ALTA       |
|RF-05  | O sistema deve permitir relatórios de acompanhamento de impacto social, mostrando número de peças arrecadadas, distribuídas e vendidas beneficentemente.                                                                                                | MÉDIA      |
|RF-06  | O sistema deve permitir registrar observações ou notas sobre cada peça, como defeitos e/ou particularidades.    | BAIXA      |
|RF-07  | O sistema deve permitir anexar fotos às peças de roupa para facilitar identificação e controle visual.          | ALTA       |
|RF-08  | O sistema deve controlar peças reservadas para distribuição ou venda beneficente.                               | MÉDIA      |
|RF-09  | O sistema deve permitir exportação de relatórios em formato simples para acompanhamento externo.                | MÉDIA      |

---

## 3.2 Histórias de Usuário

> Cada história de usuário deve ser escrita no formato:  
>  
> **Como [persona], eu quero [funcionalidade], para que [benefício/motivo].**  seguindo o modelo e conceitos ensinados na disciplina de       
> Engenharia de Requisitos.   
---
⚠️ **ATENÇÃO:** Escreva de forma que cada história de usuário esteja associada a um requisito funcional específico para facilitar o acompanhamento e validação. Por exemplo:

> **História 1 (relacionada ao Requisito RF-001):**  
> Como usuário, quero registrar minhas tarefas para não esquecer de fazê-las.  
>  
> **História 2 (relacionada ao Requisito RF-002):**  
> Como administrador, quero alterar permissões para controlar o acesso ao sistema.  
>  
> Para melhor organização, as histórias podem ser agrupadas por contexto ou módulo funcional.

---

### ✏️ Escreva aqui as histórias de usuário do seu projeto:

<div style="border: 2px dashed #999999; padding: 15px; margin: 10px 0;">
  
<!-- Espaço para escrever o texto -->  
**[Escreva aqui as histórias do seu projeto]**

- **História 1 (relacionada ao Requisito RF-01):** 

- **História 2 (relacionada ao Requisito RF-02):** 




</div>

---

## 3.3 Requisitos Não Funcionais

Preencha o Quadro abaixo com os requisitos não funcionais que definem **características desejadas para o sistema que irão desenvolver**, como desempenho, segurança, usabilidade, etc.  
> Lembre-se que esses requisitos são importantes para garantir a qualidade da solução.

|ID     | Descrição do Requisito                                                                              |Prioridade |
|-------|-----------------------------------------------------------------------------------------------------|-----------|
|RNF-01 | O sistema deve carregar as páginas em até 3 segundos para garantir uma boa experiência ao usuário.  | MÉDIA     | 
|RNF-02 | O sistema deve proteger as informações dos clientes por meio de criptografia e medidas de segurança.| ALTA      | 
|RNF-03 | *(Descreva aqui o requisito não funcional 3 do seu sistema)*                                       | *(Alta/Média/Baixa)*  |
|RNF-04 | *(Descreva aqui o requisito não funcional 4 do seu sistema)*                                       | *(Alta/Média/Baixa)*  |
|RNF-05 | *(Descreva aqui o requisito não funcional 5 do seu sistema)*                                       | *(Alta/Média/Baixa)*  |
|RNF-06 | *(Descreva aqui o requisito não funcional 6 do seu sistema)*                                       | *(Alta/Média/Baixa)*  |

---

## 3.4 Restrições do Projeto

> Restrições são limitações externas impostas ao projeto que devem ser rigorosamente obedecidas durante o desenvolvimento. Elas podem estar relacionadas a prazos, tecnologias obrigatórias ou proibidas, ambiente de execução, normas legais ou políticas internas da organização. Diferente dos requisitos não funcionais, que indicam características desejadas do sistema, as restrições determinam limites fixos que influenciam as decisões de projeto.

O Quadro abaixo deve ser preenchida com as restrições específicas que **impactam seu projeto**. Caso não haja alguma restrição adicional além das já listadas, mantenha a tabela conforme está.

| ID  | Restrição                                                              |
|------|-----------------------------------------------------------------------|
| R-01   | O projeto deverá ser entregue até o final do semestre.              |
| R-02   | O sistema deve funcionar apenas dentro da rede interna da empresa.  |
| R-03   | O software deve ser compatível com Windows e Linux.                 |
| R-04   | *(Descreva aqui a restrição 4 do seu projeto)*                      |
| R-05   | *(Descreva aqui a restrição 5 do seu projeto)*                      |
| R-06   | *(Descreva aqui a restrição 6 do seu projeto)*                      |
| R-07   | *(Descreva aqui a restrição 7 do seu projeto)*                      |
| R-08   | *(Descreva aqui a restrição 8 do seu projeto)*                      |

---
## 3.5 Regras de Negócio

> Regras de Negócio definem as condições e políticas que o sistema deve seguir para garantir o correto funcionamento alinhado ao negócio.  
>  
> Elas indicam **quando** e **como** certas ações devem ocorrer, usando o padrão:  
>  
> **Se (condição) for verdadeira, então (ação) deve ser tomada.**  
>  
> Exemplo:  
> - "Um usuário só poderá finalizar um cadastro se todos os dados forem inseridos e validados com sucesso."  
>  
> Também pode ser escrito assim (if/then):  
> - "Se o usuário tem saldo acima de X, então a opção de empréstimo estará liberada."

---

 A tabela abaixo deve ser preenchida com as regras de negócio que **impactam seu projeto**. Os textos no quadro são apenas ilustrativos.

|ID    | Regra de Negócio                                                       |
|-------|-----------------------------------------------------------------------|
|RN-01 | Usuário só pode cadastrar até 10 tarefas por dia.                      |
|RN-02 | Apenas administradores podem alterar permissões de usuários.           |
|RN-03 | Tarefas vencidas devem ser destacadas em vermelho no sistema.          |
|RN-04 | *(Descreva aqui a restrição 4 do seu projeto)*                         |
|RN-05 | *(Descreva aqui a restrição 5 do seu projeto)*                         |

💡 **Dica:** Explique sempre o motivo ou impacto da regra no sistema.

---
> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)
