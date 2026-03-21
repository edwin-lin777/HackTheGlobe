async function test() {
  const res = await fetch("http://localhost:3000/api/eligibility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postalCode: "M5V 2T6",
      householdSize: 2,
      annualIncome: 35000,
      hasArrears: false,
      isElectricHeat: false,
      isEnbridgeCustomer: true,
      isNorthernOntario: false,
      isOWSP: false,
      monthlyKwh: 700,
    }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
