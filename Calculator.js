const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

let expr = ""; // stores expression as string, e.g. "12+3*4"

function updateDisplay() {
  expressionEl.textContent = expr;
  resultEl.value = expr === "" ? "0" : expr;
}

function appendNumber(n) {
  expr += n;
  updateDisplay();
}

function appendDot() {
  // prevent multiple dots in the current number chunk
  const parts = expr.split(/[\+\-\*\/%]/);
  const last = parts[parts.length - 1];
  if (last.includes(".")) return;
  if (last === "") expr += "0";
  expr += ".";
  updateDisplay();
}

function appendOperator(op) {
  if (expr === "" && op !== "-") return; // allow starting negative numbers with "-"
  if (/[+\-*/%]$/.test(expr)) {
    // replace last operator
    expr = expr.slice(0, -1) + op;
  } else {
    expr += op;
  }
  updateDisplay();
}

function clearAll() {
  expr = "";
  updateDisplay();
}

function deleteOne() {
  expr = expr.slice(0, -1);
  updateDisplay();
}

function toggleSign() {
  // toggles sign of the last number in the expression
  if (expr === "") return;

  const match = expr.match(/(.*?)(-?\d+(\.\d+)?)$/);
  if (!match) return;

  const before = match[1];
  const numStr = match[2];
  const num = Number(numStr);
  const flipped = (-num).toString();

  expr = before + flipped;
  updateDisplay();
}

function safeEvaluate(input) {
  // Allow only digits, operators, dots, parentheses, and spaces (no letters)
  if (!/^[0-9+\-*/%.() ]*$/.test(input)) return null;

  // Disallow ending with operator
  if (/[+\-*/%]$/.test(input)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${input});`)();
    if (!Number.isFinite(val)) return null;
    return val;
  } catch {
    return null;
  }
}

function equals() {
  const val = safeEvaluate(expr);
  if (val === null) {
    resultEl.value = "Error";
    return;
  }
  expr = String(val);
  updateDisplay();
}

// Button clicks
document.querySelector(".buttons").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const num = btn.dataset.num;
  const op = btn.dataset.op;
  const action = btn.dataset.action;

  if (num !== undefined) appendNumber(num);
  else if (op) appendOperator(op);
  else if (action === "clear") clearAll();
  else if (action === "delete") deleteOne();
  else if (action === "equals") equals();
  else if (action === "dot") appendDot();
  else if (action === "sign") toggleSign();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") return appendNumber(k);

  if (k === ".") return appendDot();

  if (k === "Enter" || k === "=") {
    e.preventDefault();
    return equals();
  }

  if (k === "Backspace") return deleteOne();
  if (k === "Escape") return clearAll();

  // operators
  if (k === "+" || k === "-" || k === "*" || k === "/" || k === "%") {
    return appendOperator(k);
  }
});

// init
updateDisplay();
