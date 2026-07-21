export interface SensorIdentity {
  // --- Mechanical Constants ---
  inertiaMoment: number;        // Moment of inertia of the pendulum (I0) [kg*m^2]
  springConstant: number;       // Mechanical restoration torque constant (Kr) [N*m/rad]
  dampingPolynomial: number[];  // Polynomial coefficients for angular damping Cr(theta) [a, b, c]
  
  // --- Electromechanical Constants ---
  coilResistance: number;       // Electrical resistance of the force-rebalance coil (Rt) [Ohm]
  coilInductance: number;       // Electrical inductance of the coil (Lt) [Henry]
  pickoffGain: number;          // Sensitivity of the capacitive pick-off circuit (Kpo) [V/rad]
  torqueFactor: number;         // Magnetic torque constant, relating current to torque (Km) [N*m/A]
  
  // --- Circuit Constants ---
  loadResistor: number;         // Resistance of the output load circuit (RL) [Ohm]
  loadCapacitor: number;   
  
  environmental: {
    temperature: number;    // Celcius
    thermalExpansion: number; // CTE (Coefficient of Thermal Expansion)
    springStiffness: number;  // k (N/m)
    magneticField: number;    // (Tesla)
  }

  calibration: {
    initialBias: number;
    stiffnessFactor: number; // C1
    magneticFactor: number;  // C2
    thermalStressFactor: number; // K_BIAS
  }
}

// Reference values based on the thesis analysis
export const QFLEX_REF_IDENTITY: SensorIdentity = {
  inertiaMoment: 1.25e-6,
  springConstant: 0.05,
  dampingPolynomial: [0.01, 0.002, 0.0001],
  coilResistance: 150,
  coilInductance: 0.002,
  pickoffGain: 2500,
  torqueFactor: 0.045,
  loadResistor: 10000,
  loadCapacitor: 1e-9,
  environmental: {
    temperature: 25,
    thermalExpansion: 12e-6,
    springStiffness: 1500,
    magneticField: 0.05
  },
  calibration: {
    initialBias: 0.05,
    stiffnessFactor: 1500,
    magneticFactor: 0.5,
    thermalStressFactor: 5000
  }
};

export const SENSOR_LIMITS = {
  inertia: { 
    min: 5e-8, 
    max: 1e-6, 
    step: 5e-8 
  },
  dampingA: { 
    min: 0.001, 
    max: 0.02, 
    step: 0.001 
  },
  dampingB: { 
    min: 0.00001, 
    max: 0.0005, 
    step: 0.00001 
  },
  dampingC: { 
    min: 0.0000001, 
    max: 0.000005, 
    step: 0.0000001 
  },
  temperature: { 
    min: -40, 
    max: 85, 
    step: 1 
  },
  thermalExpansion: { 
    min: 1e-6, 
    max: 25e-6, 
    step: 0.1e-6 
  }, 
  springStiffness: { 
    min: 100, 
    max: 5000, 
    step: 10 
  },
  magneticField: { 
    min: 0, 
    max: 0.5, 
    step: 0.01 
  }
};