function randomBetween(min, max, decimals = 1) {
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(decimals));
}

export function createSimulatedEnvironment() {
  return {
    temperature: randomBetween(10, 42),
    oxygenLevel: randomBetween(18, 23),
    humidity: randomBetween(20, 90),
    windSpeed: randomBetween(0, 45),
    pressure: randomBetween(950, 1040),
    rainfall: randomBetween(0, 30),
  };
}
