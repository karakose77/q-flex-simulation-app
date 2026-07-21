import { Injectable } from '@angular/core';
import { create, all, Complex } from 'mathjs';
import { SensorIdentity } from './sensor-identity.model';

const math = create(all);

@Injectable({ providedIn: 'root' })
export class CalculatorService {

  calculatePerformance(env: any, cal: any) {
    const deltaT = env.temperature - 25;
    
    // Modelden gelen kalibrasyon sabitlerini kullanarak hesaplama
    const bias = cal.initialBias + (cal.thermalStressFactor * env.thermalExpansion * deltaT);
    const sf = (cal.stiffnessFactor / env.springStiffness) * (1 + cal.magneticFactor * env.magneticField);

    return { bias, sf };
  }

  /**
   * Calculates the frequency response (Bode data) for the given sensor parameters.
   * Uses the transfer function: G(s) = (Kpo * Km) / (I0*s^2 + Cr*s + Kr)
   * * @param sensor - The sensor identity constants
   * @param frequency - The input frequency in Hz
   * @returns An object containing magnitude (dB) and phase (degrees)
   */
  calculateFrequencyResponse(sensor: SensorIdentity, frequency: number, performance: { bias: number; sf: number }) {
    const w = 2 * Math.PI * frequency; // Angular frequency (rad/s)
    
    // Define complex variable s = j*w
    const s = math.complex(0, w);
    const sSquared = math.multiply(s, s) as Complex;
    
    // Apply mechanical damping from the damping polynomial: Cr = a + b*w + c*w^2
    const a = sensor.dampingPolynomial[0];
    const b = sensor.dampingPolynomial[1];
    const c = sensor.dampingPolynomial[2];
    
    const Cr = a + (b * w) + (c * Math.pow(w, 2)); 
    
    // Construct the denominator: I0*s^2 + Cr*s + Kr
    const denominator = math.add(
      math.multiply(sensor.inertiaMoment, sSquared),
      math.add(math.multiply(Cr, s), sensor.springConstant)
    ) as Complex;

    // Construct the numerator: Kpo * Km
    const numerator = math.multiply(sensor.pickoffGain, sensor.torqueFactor);
    
    // G(j*w) = Numerator / Denominator
    const G_jw = math.divide(numerator, denominator) as Complex;

    // Magnitude'ye SF (Scale Factor) ile kazanç uygula
    const G_jw_scaled = math.multiply(G_jw, performance.sf) as Complex;

    // Not: G_jw kompleks bir sayı, bias'ı sadece reel kısma (magnitude tarafına) ekliyoruz.
    const G_jw_final = math.add(G_jw_scaled, performance.bias) as Complex;
    
    return {
      frequency,
      magnitude: 20 * Math.log10(math.abs(G_jw_final) as number),
      phase: math.arg(G_jw_final) as number * (180 / Math.PI)  
    };
  }
}