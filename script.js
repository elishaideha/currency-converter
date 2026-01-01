"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const API_KEY = "9d32b4558f7a3f3a072f4c0e";
  const form = document.getElementById("currency-form");
  const convertResult = document.querySelector(".result");
  const amountInput = document.getElementById("amount");
  const fromCurrencySelect = document.getElementById("from-currency");
  const toCurrencySelect = document.getElementById("to-currency");

  ///////FetchCurrency
  async function populateCurrencies() {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch currency codes");
      }

      const data = await response.json();
      if (data.result !== "success") {
        throw new Error(data["error-type"] || "API error");
      }

      const currencyCodes = data.supported_codes;

      fromCurrencySelect.innerHTML =
        '<option value="">Select currency</option>';
      toCurrencySelect.innerHTML = '<option value="">Select currency</option>';

      for (const [code, name] of currencyCodes) {
        const optionFrom = document.createElement("option");
        optionFrom.value = code;
        optionFrom.textContent = `${code} - ${name}`;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement("option");
        optionTo.value = code;
        optionTo.textContent = `${code} - ${name}`;
        toCurrencySelect.appendChild(optionTo);
      }

      fromCurrencySelect.value = "USD";
      toCurrencySelect.value = "EUR";
    } catch (error) {
      console.error("Error fetching currency list:", error);
      convertResult.textContent =
        "Failed to load currency list. Please try again later.";
    }
  }

  //////FetchExchangeRate
  async function fetchExchangeRate(USD) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/9d32b4558f7a3f3a072f4c0e/latest/USD`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.result !== "success") {
        throw new Error(data["error-type"] || "API request failed");
      }

      return data.conversion_rates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      convertResult.textContent =
        "Failed to fetch exchange rates. Please try again later.";
      return null;
    }
  }

  //////ConvertCurrency
  async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (!amount || isNaN(amount)) {
      convertResult.textContent = "Please enter a valid amount";
      return;
    }

    if (fromCurrency === toCurrency) {
      convertResult.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
      return;
    }

    convertResult.textContent = "Converting...";

    const rates = await fetchExchangeRate(fromCurrency);
    if (!rates) return;

    if (!rates[toCurrency]) {
      convertResult.textContent = "Invalid target currency";
      return;
    }

    const convertedAmount = (amount * rates[toCurrency]).toFixed(2);
    convertResult.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
  }

  populateCurrencies();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    convertCurrency();
  });
});
