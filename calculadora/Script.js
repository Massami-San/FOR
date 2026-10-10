const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");
const displayMessage = document.querySelector("#display-message");
const angleModeDisplay = document.querySelector("#angle-mode");
const scientificToggle = document.querySelector("#scientific-toggle");
const scientificKeys = document.querySelector("#scientific-keys");
const angleToggle = document.querySelector("#angle-toggle");
const secondToggle = document.querySelector("#second-toggle");
const historyList = document.querySelector("#history-list");

let expression = "";
let lastAnswer = 0;
let angleMode = "DEG";
let inverseFunctions = false;
let justEvaluated = false;
let history = [];

function displayExpression(value) {
  return (value || "0")
    .replaceAll("*", "×")
    .replaceAll("/", "÷")
    .replaceAll("-", "−")
    .replaceAll(".", ",")
    .replaceAll("pi", "π");
}

function render() {
  expressionDisplay.textContent = displayExpression(expression);
  expressionDisplay.scrollLeft = expressionDisplay.scrollWidth;
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    throw new Error("O resultado não é um número finito.");
  }

  if (Object.is(value, -0)) {
    value = 0;
  }

  return Number(value.toPrecision(12)).toString();
}

function tokenize(source) {
  const tokens = [];
  let position = 0;

  while (position < source.length) {
    const rest = source.slice(position);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      position += whitespace[0].length;
      continue;
    }

    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      position += number[0].length;
      continue;
    }

    const name = rest.match(/^[a-z]+/i);
    if (name) {
      tokens.push({ type: "name", value: name[0].toLowerCase() });
      position += name[0].length;
      continue;
    }

    const character = source[position];
    if ("+-*/^()%!".includes(character)) {
      tokens.push({ type: character, value: character });
      position += 1;
      continue;
    }

    throw new Error(`Caractere não reconhecido: ${character}`);
  }

  return tokens;
}

function evaluate(source) {
  const tokens = tokenize(source);
  let position = 0;

  function current() {
    return tokens[position];
  }

  function take(type) {
    if (current()?.type !== type) {
      return false;
    }
    position += 1;
    return true;
  }

  function parseExpression() {
    let value = parseMultiplication();
    while (current()?.type === "+" || current()?.type === "-") {
      const operator = tokens[position++].type;
      const right = parseMultiplication();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseMultiplication() {
    let value = parseUnary();
    while (true) {
      if (take("*")) {
        value *= parseUnary();
      } else if (take("/")) {
        const divisor = parseUnary();
        if (divisor === 0) {
          throw new Error("Não é possível dividir por zero.");
        }
        value /= divisor;
      } else if (current()?.type === "name" && current().value === "mod") {
        position += 1;
        const divisor = parseUnary();
        if (divisor === 0) {
          throw new Error("Não é possível calcular módulo por zero.");
        }
        value %= divisor;
      } else if (startsPrimary(current())) {
        value *= parseUnary();
      } else {
        break;
      }
    }
    return value;
  }

  function parseUnary() {
    if (take("+")) {
      return parseUnary();
    }
    if (take("-")) {
      return -parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePostfix();
    if (take("^")) {
      return base ** parseUnary();
    }
    return base;
  }

  function parsePostfix() {
    let value = parsePrimary();
    while (current()?.type === "!" || current()?.type === "%") {
      const operator = tokens[position++].type;
      if (operator === "!") {
        value = factorial(value);
      } else {
        value /= 100;
      }
    }
    return value;
  }

  function parsePrimary() {
    const token = current();
    if (!token) {
      throw new Error("Complete a expressão para calcular.");
    }

    if (take("number")) {
      return token.value;
    }

    if (take("(")) {
      const value = parseExpression();
      if (!take(")")) {
        throw new Error("Está faltando fechar um parêntese.");
      }
      return value;
    }

    if (token.type === "name") {
      position += 1;
      if (token.value === "mod") {
        throw new Error("Use “mod” entre dois números.");
      }
      if (token.value === "pi") {
        return Math.PI;
      }
      if (token.value === "e") {
        return Math.E;
      }
      if (token.value === "ans") {
        return lastAnswer;
      }

      if (!take("(")) {
        throw new Error(`Função ou constante desconhecida: ${token.value}`);
      }
      const argument = parseExpression();
      if (!take(")")) {
        throw new Error("Está faltando fechar um parêntese.");
      }
      return applyFunction(token.value, argument);
    }

    throw new Error("Expressão incompleta ou inválida.");
  }

  if (tokens.length === 0) {
    throw new Error("Digite uma expressão para calcular.");
  }

  const value = parseExpression();
  if (position !== tokens.length) {
    throw new Error("Confira a expressão e tente novamente.");
  }
  if (!Number.isFinite(value)) {
    throw new Error("Essa operação não tem um resultado finito.");
  }
  return value;
}

function startsPrimary(token) {
  return token?.type === "number" || token?.type === "name" || token?.type === "(";
}

function factorial(value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("O fatorial só aceita números inteiros não negativos.");
  }
  if (value > 170) {
    throw new Error("O resultado do fatorial é grande demais.");
  }

  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }
  return result;
}

function applyFunction(name, value) {
  const radians = angleMode === "DEG" ? value * (Math.PI / 180) : value;
  const fromRadians = (result) => angleMode === "DEG" ? result * (180 / Math.PI) : result;

  const functions = {
    sin: () => Math.sin(radians),
    cos: () => Math.cos(radians),
    tan: () => {
      if (Math.abs(Math.cos(radians)) < 1e-12) {
        throw new Error("A tangente não está definida para esse ângulo.");
      }
      return Math.tan(radians);
    },
    asin: () => fromRadians(Math.asin(value)),
    acos: () => fromRadians(Math.acos(value)),
    atan: () => fromRadians(Math.atan(value)),
    sqrt: () => Math.sqrt(value),
    cbrt: () => Math.cbrt(value),
    abs: () => Math.abs(value),
    log: () => Math.log10(value),
    ln: () => Math.log(value),
    log2: () => Math.log2(value),
    exp: () => Math.exp(value),
    floor: () => Math.floor(value),
    ceil: () => Math.ceil(value),
    round: () => Math.round(value),
  };

  const operation = functions[name];
  if (!operation) {
    throw new Error(`Função desconhecida: ${name}`);
  }
  const result = operation();
  if (!Number.isFinite(result)) {
    throw new Error("Confira os valores usados nessa função.");
  }
  return result;
}

function showError(error) {
  resultDisplay.textContent = error.message;
  resultDisplay.classList.add("error");
  displayMessage.textContent = "Não foi possível calcular";
  justEvaluated = false;
}

function clearError() {
  resultDisplay.classList.remove("error");
  displayMessage.textContent = "Pronta para calcular";
}

function calculate() {
  try {
    const value = evaluate(expression);
    const formatted = formatResult(value);
    lastAnswer = Number(formatted);
    resultDisplay.textContent = formatted.replace(".", ",");
    resultDisplay.classList.remove("error");
    displayMessage.textContent = "Cálculo concluído";
    history.unshift({ expression, result: formatted });
    history = history.slice(0, 20);
    renderHistory();
    justEvaluated = true;
  } catch (error) {
    showError(error);
  }
}

function addInput(value) {
  clearError();
  if (justEvaluated) {
    if (/^[0-9.]$/.test(value) || value === "pi" || value === "e" || value === "ans" || value.endsWith("(")) {
      expression = "";
    } else if (/^[+*/^%!-]$/.test(value)) {
      expression = String(lastAnswer);
    }
    justEvaluated = false;
  }
  expression += value;
  render();
}

function handleKey(button) {
  if (button.dataset.action === "clear") {
    expression = "";
    resultDisplay.textContent = "0";
    clearError();
    justEvaluated = false;
    render();
    return;
  }

  if (button.dataset.action === "delete") {
    expression = expression.slice(0, -1);
    justEvaluated = false;
    clearError();
    render();
    return;
  }

  if (button.dataset.action === "sign") {
    if (expression) {
      expression = expression.startsWith("-(") && expression.endsWith(")")
        ? expression.slice(2, -1)
        : `-(${expression})`;
    } else {
      expression = "-";
    }
    justEvaluated = false;
    clearError();
    render();
    return;
  }

  if (button.dataset.action === "equals") {
    calculate();
    return;
  }

  const value = inverseFunctions && button.dataset.inverse
    ? button.dataset.inverse
    : button.dataset.value;
  if (value !== undefined) {
    addInput(value);
  }
}

function renderHistory() {
  historyList.replaceChildren();
  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-history";
    empty.innerHTML = '<span class="history-icon" aria-hidden="true">↗</span><p>Seus cálculos aparecem aqui.</p><span>Faça uma conta para começar.</span>';
    historyList.append(empty);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "history-item";
    item.setAttribute("aria-label", `${displayExpression(entry.expression)} igual a ${entry.result}`);

    const itemExpression = document.createElement("span");
    itemExpression.className = "history-expression";
    itemExpression.textContent = displayExpression(entry.expression);
    const itemResult = document.createElement("span");
    itemResult.className = "history-result";
    itemResult.textContent = entry.result.replace(".", ",");

    item.append(itemExpression, itemResult);
    item.addEventListener("click", () => {
      expression = entry.result;
      resultDisplay.textContent = entry.result.replace(".", ",");
      resultDisplay.classList.remove("error");
      displayMessage.textContent = "Resultado do histórico";
      justEvaluated = true;
      render();
    });
    historyList.append(item);
  });
}

document.querySelector("#keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) {
    handleKey(button);
  }
});

scientificKeys.addEventListener("click", (event) => {
  const button = event.target.closest("button.key");
  if (button) {
    handleKey(button);
  }
});

scientificToggle.addEventListener("click", () => {
  const isExpanded = scientificToggle.getAttribute("aria-expanded") === "true";
  scientificToggle.setAttribute("aria-expanded", String(!isExpanded));
  scientificKeys.hidden = isExpanded;
});

angleToggle.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleModeDisplay.textContent = angleMode;
  angleToggle.innerHTML = `${angleMode === "DEG" ? "Graus" : "Radianos"} <span>${angleMode}</span>`;
});

secondToggle.addEventListener("click", () => {
  inverseFunctions = !inverseFunctions;
  secondToggle.setAttribute("aria-pressed", String(inverseFunctions));
  scientificKeys.querySelectorAll(".key-science[data-inverse]").forEach((button) => {
    button.textContent = inverseFunctions
      ? button.dataset.inverse.replace("(", "")
      : button.dataset.value.replace("(", "");
  });
});

document.querySelector("#clear-history").addEventListener("click", () => {
  history = [];
  renderHistory();
});

document.querySelector("#copy-result").addEventListener("click", async () => {
  if (resultDisplay.classList.contains("error")) {
    displayMessage.textContent = "Calcule um resultado antes de copiar";
    return;
  }
  try {
    await navigator.clipboard.writeText(resultDisplay.textContent.replace(",", "."));
    displayMessage.textContent = "Resultado copiado";
  } catch {
    displayMessage.textContent = "Não foi possível copiar o resultado";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (/^[0-9.+*/^()%!-]$/.test(event.key)) {
    event.preventDefault();
    addInput(event.key);
  } else if (event.key === "," || event.key === ".") {
    event.preventDefault();
    addInput(".");
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    handleKey({ dataset: { action: "delete" } });
  } else if (event.key === "Escape") {
    handleKey({ dataset: { action: "clear" } });
  }
});

render();
