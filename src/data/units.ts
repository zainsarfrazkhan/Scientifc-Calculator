import { UnitCategory } from '../types';

export const unitCategories: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    units: [
      { name: 'Meters', symbol: 'm', factor: 1 },
      { name: 'Kilometers', symbol: 'km', factor: 1000 },
      { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
      { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
      { name: 'Miles', symbol: 'mi', factor: 1609.344 },
      { name: 'Yards', symbol: 'yd', factor: 0.9144 },
      { name: 'Feet', symbol: 'ft', factor: 0.3048 },
      { name: 'Inches', symbol: 'in', factor: 0.0254 }
    ]
  },
  {
    id: 'mass',
    name: 'Mass',
    units: [
      { name: 'Kilograms', symbol: 'kg', factor: 1 },
      { name: 'Grams', symbol: 'g', factor: 0.001 },
      { name: 'Milligrams', symbol: 'mg', factor: 0.000001 },
      { name: 'Pounds', symbol: 'lb', factor: 0.45359237 },
      { name: 'Ounces', symbol: 'oz', factor: 0.028349523125 },
      { name: 'Stones', symbol: 'st', factor: 6.35029318 }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    // Temperature handles conversion mathematically using offsets rather than pure factor.
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
      { name: 'Fahrenheit', symbol: '°F', factor: 5/9, offset: 32 },
      { name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15 }
    ]
  },
  {
    id: 'area',
    name: 'Area',
    units: [
      { name: 'Square Meters', symbol: 'm²', factor: 1 },
      { name: 'Square Kilometers', symbol: 'km²', factor: 1000000 },
      { name: 'Square Feet', symbol: 'ft²', factor: 0.09290304 },
      { name: 'Acres', symbol: 'ac', factor: 4046.8564224 },
      { name: 'Hectares', symbol: 'ha', factor: 10000 }
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      { name: 'Liters', symbol: 'L', factor: 0.001 },
      { name: 'Milliliters', symbol: 'mL', factor: 0.000001 },
      { name: 'Cubic Meters', symbol: 'm³', factor: 1 },
      { name: 'Gallons (US)', symbol: 'gal', factor: 0.00378541 },
      { name: 'Quarts (US)', symbol: 'qt', factor: 0.000946353 },
      { name: 'Cups (US)', symbol: 'cup', factor: 0.000236588 },
      { name: 'Fluid Ounces (US)', symbol: 'fl oz', factor: 0.0000295735 }
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    units: [
      { name: 'Meters / Second', symbol: 'm/s', factor: 1 },
      { name: 'Kilometers / Hour', symbol: 'km/h', factor: 1 / 3.6 },
      { name: 'Miles / Hour', symbol: 'mi/h', factor: 0.44704 },
      { name: 'Knots', symbol: 'kn', factor: 0.514444 },
      { name: 'Mach', symbol: 'Mach', factor: 340.29 }
    ]
  },
  {
    id: 'time',
    name: 'Time',
    units: [
      { name: 'Seconds', symbol: 's', factor: 1 },
      { name: 'Minutes', symbol: 'min', factor: 60 },
      { name: 'Hours', symbol: 'hr', factor: 3600 },
      { name: 'Days', symbol: 'd', factor: 86400 },
      { name: 'Weeks', symbol: 'wk', factor: 604800 },
      { name: 'Years (365d)', symbol: 'yr', factor: 31536000 }
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    units: [
      { name: 'Pascal', symbol: 'Pa', factor: 1 },
      { name: 'Bar', symbol: 'bar', factor: 100000 },
      { name: 'Atmosphere', symbol: 'atm', factor: 101325 },
      { name: 'PSI', symbol: 'psi', factor: 6894.757 },
      { name: 'Torr / mmHg', symbol: 'Torr', factor: 133.3224 }
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    units: [
      { name: 'Joules', symbol: 'J', factor: 1 },
      { name: 'Calories (kcal)', symbol: 'kcal', factor: 4184 },
      { name: 'Watt-Hours', symbol: 'Wh', factor: 3600 },
      { name: 'Kilowatt-Hours', symbol: 'kWh', factor: 3600000 },
      { name: 'Electronvolts', symbol: 'eV', factor: 1.602176634e-19 },
      { name: 'BTU', symbol: 'BTU', factor: 1055.056 }
    ]
  }
];

export function convertUnits(
  value: number,
  fromSymbol: string,
  toSymbol: string,
  category: UnitCategory
): number {
  const fromUnit = category.units.find(u => u.symbol === fromSymbol);
  const toUnit = category.units.find(u => u.symbol === toSymbol);

  if (!fromUnit || !toUnit) return 0;

  // Handle special temperature conversion formulas
  if (category.id === 'temperature') {
    let valueInCelsius = value;
    if (fromSymbol === '°F') {
      valueInCelsius = (value - 32) * (5 / 9);
    } else if (fromSymbol === 'K') {
      valueInCelsius = value - 273.15;
    }

    if (toSymbol === '°C') {
      return valueInCelsius;
    } else if (toSymbol === '°F') {
      return valueInCelsius * (9 / 5) + 32;
    } else if (toSymbol === 'K') {
      return valueInCelsius + 273.15;
    }
    return value;
  }

  // Base factor calculation for standard units
  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}
