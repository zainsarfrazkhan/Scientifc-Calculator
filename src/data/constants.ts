import { PhysicalConstant } from '../types';

export const physicalConstants: PhysicalConstant[] = [
  {
    name: 'Speed of Light',
    symbol: 'c',
    value: 299792458,
    unit: 'm / s',
    category: 'Physics',
    description: 'The speed of electromagnetic radiation in a vacuum.'
  },
  {
    name: 'Planck Constant',
    symbol: 'h',
    value: 6.62607015e-34,
    unit: 'J s',
    category: 'Physics',
    description: 'The quantum of electromagnetic action relating energy to frequency.'
  },
  {
    name: 'Gravitational Constant',
    symbol: 'G',
    value: 6.6743e-11,
    unit: 'm³ / (kg s²)',
    category: 'Cosmology',
    description: 'Empirical physical constant involved in calculating gravity.'
  },
  {
    name: 'Acceleration due to Gravity',
    symbol: 'g',
    value: 9.80665,
    unit: 'm / s²',
    category: 'Physics',
    description: 'Standard Earth gravitational acceleration.'
  },
  {
    name: 'Avogadro Number',
    symbol: 'N_A',
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    category: 'Chemistry',
    description: 'The number of constituent particles per mole of substance.'
  },
  {
    name: 'Boltzmann Constant',
    symbol: 'k',
    value: 1.380649e-23,
    unit: 'J / K',
    category: 'Chemistry',
    description: 'Relates mean kinetic energy of gas particles with temperature.'
  },
  {
    name: 'Molar Gas Constant',
    symbol: 'R',
    value: 8.314462618,
    unit: 'J / (mol K)',
    category: 'Chemistry',
    description: 'Constant in the ideal gas equation.'
  },
  {
    name: 'Elementary Charge',
    symbol: 'e_charge',
    value: 1.602176634e-19,
    unit: 'C',
    category: 'Physics',
    description: 'Electric charge carried by a single proton.'
  },
  {
    name: 'Electron Mass',
    symbol: 'm_e',
    value: 9.1093837e-31,
    unit: 'kg',
    category: 'Physics',
    description: 'The rest mass of a single electron.'
  },
  {
    name: 'Proton Mass',
    symbol: 'm_p',
    value: 1.6726219e-27,
    unit: 'kg',
    category: 'Physics',
    description: 'The rest mass of a single proton.'
  },
  {
    name: 'Permittivity of Free Space',
    symbol: 'ε_0',
    value: 8.854187817e-12,
    unit: 'F / m',
    category: 'Physics',
    description: 'The capability of a vacuum to permit electric field lines.'
  },
  {
    name: 'Permeability of Free Space',
    symbol: 'μ_0',
    value: 1.25663706212e-6,
    unit: 'N / A²',
    category: 'Physics',
    description: 'Measure of amount of resistance encountered when forming a magnetic field.'
  },
  {
    name: 'Pi',
    symbol: 'π',
    value: 3.141592653589793,
    unit: 'dimensionless',
    category: 'Mathematics',
    description: 'Ratio of a circle\'s circumference to its diameter.'
  },
  {
    name: 'Euler\'s Number',
    symbol: 'e',
    value: 2.718281828459045,
    unit: 'dimensionless',
    category: 'Mathematics',
    description: 'Base of natural logarithms.'
  },
  {
    name: 'Golden Ratio',
    symbol: 'φ',
    value: 1.618033988749895,
    unit: 'dimensionless',
    category: 'Mathematics',
    description: 'Mathematical constant found throughout biology, art, and geometry.'
  }
];
