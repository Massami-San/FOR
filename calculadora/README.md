# Calculadora

Uma calculadora web moderna, responsiva e em português. O projeto foi criado do zero com HTML, CSS e JavaScript puro: não precisa de instalação, bibliotecas ou servidor para fazer cálculos no navegador.

## 1. Como abrir

1. Abra a pasta `calculadora` no seu computador ou no Visual Studio Code.
2. Abra o arquivo `index.html` em um navegador.
3. Comece a calcular. Não é preciso instalar dependências nem executar um processo de compilação.

Se você usa a extensão **Live Server** no Visual Studio Code, também pode clicar com o botão direito em `index.html` e selecionar **Open with Live Server**. A página será atualizada automaticamente quando você salvar alterações.

## 2. Como usar

### Operações básicas

Use os botões na tela ou o teclado do computador para digitar uma expressão. A calculadora inclui:

- Adição (`+`), subtração (`−`), multiplicação (`×`) e divisão (`÷`).
- Números decimais: o visor mostra a vírgula, por exemplo `2,5`.
- Porcentagem (`%`), aplicada ao número anterior. Por exemplo, `50%` resulta em `0,5`.
- Mudança de sinal (`+/−`), parênteses, apagar o último caractere (`⌫`) e limpar a expressão (`AC`).
- Multiplicação implícita: expressões como `2(3 + 4)` e `2pi` são interpretadas como multiplicações.

O teclado físico reconhece algarismos, ponto ou vírgula decimal, operadores e parênteses. Use `Enter` ou `=` para calcular, `Backspace` para apagar e `Escape` para limpar.

### Funções científicas

Selecione **Científica** para exibir as funções adicionais:

- Trigonometria: seno (`sin`), cosseno (`cos`) e tangente (`tan`).
- Funções trigonométricas inversas: `asin`, `acos` e `atan`. Selecione **2nd** para alternar os botões trigonométricos entre as funções diretas e inversas.
- Logaritmos: `log` (base 10) e `ln` (logaritmo natural).
- Raiz quadrada (`√`), raiz cúbica (`∛`) e valor absoluto (`|x|`).
- Potências: elevar ao quadrado (`x²`) ou a uma potência escolhida (`xʸ`).
- Fatorial (`n!`), exponencial (`eˣ`) e resto da divisão (`mod`).
- Constantes π (`pi`) e e, além de `ANS`, que insere o último resultado.

Por padrão, os ângulos trigonométricos são interpretados em graus (`DEG`). Use o botão de ângulo para alternar para radianos (`RAD`). O modo selecionado aparece no visor.

### Histórico e cópia

- Cada resultado calculado é acrescentado ao histórico da sessão atual.
- Selecione um cálculo do histórico para colocar seu resultado de volta no visor.
- Use **Limpar** para apagar os cálculos exibidos no histórico.
- Selecione o ícone de cópia ao lado do resultado para copiá-lo.

O histórico e o último resultado ficam na memória da página. Ao recarregar ou fechar a página, eles são reiniciados; não há armazenamento permanente nem envio de cálculos a um servidor.

## 3. Exemplos

| Expressão | Resultado esperado | O que demonstra |
| --- | ---: | --- |
| `12 + 8 × 2` | `28` | A multiplicação é calculada antes da adição |
| `(12 + 8) × 2` | `40` | Parênteses alteram a ordem das operações |
| `2^3` | `8` | Potência |
| `sqrt(81)` | `9` | Raiz quadrada |
| `sin(30)` | `0,5` | Seno com o modo DEG selecionado |
| `5!` | `120` | Fatorial |
| `10 mod 3` | `1` | Resto da divisão |
| `2pi` | Aproximadamente `6,28318530718` | Constante π e multiplicação implícita |

As funções também podem ser digitadas na expressão usando seus nomes, por exemplo `cos(60)`, `log(1000)` e `ln(e)`.

## 4. Como os arquivos se organizam

- [`index.html`](./index.html): estrutura da página, controles, visor, teclado e histórico. Define o idioma como português brasileiro e carrega o CSS e o JavaScript.
- [`style.css`](./style.css): cores, tipografia, espaçamento, estados dos botões e adaptação do layout para telas menores.
- [`Script.js`](./Script.js): entrada pelo teclado e pelos botões, interpretação das expressões, cálculo, atualização do visor e gerenciamento do histórico.

O projeto não usa framework nem dependências JavaScript. As fontes DM Sans e Space Grotesk são carregadas do Google Fonts quando há conexão; sem acesso à internet, o navegador usa fontes alternativas instaladas no sistema.

## 5. Como o cálculo funciona

O JavaScript transforma a expressão em uma sequência de tokens — números, operadores, nomes de funções, constantes e parênteses — e depois a interpreta respeitando a precedência matemática:

1. Parênteses e argumentos das funções.
2. Fatorial e porcentagem após o número (`5!`, `20%`).
3. Potências (`^`).
4. Sinais unários (`-` e `+`).
5. Multiplicação, divisão e módulo (`*`, `/`, `mod`), incluindo multiplicação implícita.
6. Adição e subtração (`+`, `-`).

Os cálculos são feitos por um interpretador restrito implementado no projeto; a expressão não é executada como código JavaScript. Divisão por zero, expressões incompletas, funções desconhecidas, raízes ou logaritmos fora do domínio real e resultados não finitos são apresentados como erros no visor. O fatorial aceita inteiros não negativos até `170`, limite para evitar resultados que excedam a faixa numérica disponível.

Os resultados são arredondados para até 12 algarismos significativos e apresentados com vírgula decimal. Isso é adequado para uma calculadora de uso geral, mas, como ocorre com números de ponto flutuante em JavaScript, não substitui aritmética decimal de precisão arbitrária para aplicações financeiras ou científicas de alta precisão.

## 6. Aparência e acessibilidade

O visual usa fundo claro, cartões brancos, detalhes em violeta e tipografia limpa, sem efeitos excessivos. O layout coloca a calculadora e o histórico lado a lado em telas maiores e empilha os elementos em telas estreitas.

Os controles são botões HTML, podem ser usados com teclado e incluem rótulos para leitores de tela. O visor anuncia atualizações, e os estados de foco ajudam a identificar o controle selecionado.

## 7. Escopo

“Todos os cálculos possíveis” não é um escopo finito: há operações especializadas, sistemas de unidades e áreas inteiras da matemática que exigiriam funcionalidades próprias. Esta versão cobre cálculos aritméticos comuns e um conjunto útil de funções científicas, sem conversores de unidades, equações simbólicas, estatística avançada ou cálculos financeiros especializados. Novas funções podem ser acrescentadas ao interpretador e à seção de teclas científicas.
