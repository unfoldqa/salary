const MBO_AMOUNT = 30540
const ADVANCE = 30450
const DI_AMOUNT = 60900

const mbo = document.getElementById("MBO")
const di = document.getElementById("DI")
const unpaid = document.getElementById("unpaid")
const salary_html = document.getElementById("salary")
const button = document.getElementById("button")
const workingDaysHint = document.getElementById("workingDaysHint")

function getWorkingDays(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  let count = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, monthIndex, day).getDay()
    if (weekday !== 0 && weekday !== 6) count++
  }
  return count
}

const now = new Date()
const workingDays = getWorkingDays(now.getFullYear(), now.getMonth())
const monthName = now.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
workingDaysHint.textContent = `Рабочих дней в текущем месяце (${monthName}): ${workingDays}. Удержание считается от аванса.`

function limitPercent(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d]/g, "")
    const value = parseInt(input.value, 10) || 0
    if (value > 100) input.value = 100
  })
}

function limitUnpaid(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d]/g, "")
    const value = parseInt(input.value, 10) || 0
    if (value > workingDays) input.value = workingDays
  })
}

limitPercent(mbo)
limitPercent(di)
limitUnpaid(unpaid)

function animateValue(el, start, end, duration, prefix = "", suffix = "") {
  let startTime = null
  function step(ts) {
    if (!startTime) startTime = ts
    const progress = Math.min((ts - startTime) / duration, 1)
    const value = Math.round(start + (end - start) * progress)
    el.innerHTML = `${prefix}${value.toLocaleString("ru-RU")} ${suffix}`
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function calculate() {
  const mboVal = parseInt(mbo.value, 10) || 0
  const diVal = parseInt(di.value, 10) || 0
  const unpaidDays = parseInt(unpaid.value, 10) || 0

  const mboPay = (mboVal / 100) * MBO_AMOUNT
  const diPay = (diVal / 100) * DI_AMOUNT
  const deduction = workingDays > 0
    ? (ADVANCE / workingDays) * Math.min(unpaidDays, workingDays)
    : 0

  const advancePay = Math.max(0, ADVANCE - deduction)
  const total = advancePay + mboPay + diPay
  const salary10 = mboPay + diPay

  salary_html.classList.remove("animate-salary")
  void salary_html.offsetWidth
  salary_html.classList.add("animate-salary")

  const unpaidLine = unpaidDays > 0
    ? `<div id="leave"></div>`
    : ""

  salary_html.innerHTML = `
    <div id="total"></div>
    <div id="a25"></div>
    <div id="z10"></div>
    ${unpaidLine}
  `

  animateValue(document.getElementById("total"), 0, total, 2000, "Ваша зарплата: ", "₽")
  animateValue(document.getElementById("a25"), 0, advancePay, 1500, "Аванс 25 числа: ", "₽")
  animateValue(document.getElementById("z10"), 0, salary10, 1500, "Зарплата 10 числа: ", "₽")

  if (unpaidDays > 0) {
    animateValue(
      document.getElementById("leave"),
      0,
      deduction,
      1500,
      `Удержание за свой счёт (${unpaidDays} дн.): −`,
      "₽"
    )
  }
}

button.addEventListener("click", calculate)

unpaid.addEventListener("keydown", (event) => {
  if (event.key === "Enter") calculate()
})
mbo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") calculate()
})
di.addEventListener("keydown", (event) => {
  if (event.key === "Enter") calculate()
})
