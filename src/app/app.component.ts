import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { QFLEX_REF_IDENTITY, SENSOR_LIMITS, SensorIdentity } from './sensor-identity.model';
import { CalculatorService } from './calculator.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PhysicsInfoDialog } from './components/physics-info-dialog/physics-info-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgxEchartsDirective, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    provideEchartsCore({ echarts: () => import('echarts') })
  ]
})
export class AppComponent {
  f: number[] = [];
  mag: number[] = [];
  pha: number[] = [];
  damping = 0.5;
  chartOptions: any = {};
  localIdentity: SensorIdentity = { ...QFLEX_REF_IDENTITY };
  limits = SENSOR_LIMITS;
  performanceMetrics: any = { bias: 0, sf: 1 }; 
  referenceData: any = null;
  resonanceFrequency: number = 0;

  constructor(
    private cdr: ChangeDetectorRef, 
    private calculatorService: CalculatorService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // DOM oluştuktan sonra çalışır, hata vermez
    this.updateChart();
  }

  // Hesaplama (Servis yerine burada duruyor)
  updateChart() {
    this.f = [];
    this.mag = [];
    this.pha = [];

    console.log('Calculating performance metrics with spring stiffness:', this.localIdentity.environmental.springStiffness);
    
    this.performanceMetrics = this.calculatorService.calculatePerformance(
      this.localIdentity.environmental, 
      this.localIdentity.calibration
    );

    // Basit örnek hesaplama (Kendi hesaplamanızı buraya koyun)
    for (let i = 0.1; i <= 1000; i *= 1.2) {
      const resp = this.calculatorService.calculateFrequencyResponse(this.localIdentity, i, this.performanceMetrics);
      this.f.push(i);
      this.mag.push(resp.magnitude);
      this.pha.push(resp.phase);
    }

    this.calculateResonance(); // Rezonans frekansını hesapla

    this.chartOptions = {
      legend: {
        data: ['Magnitude', 'Phase'],
        top: '5%' 
      },
      tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      dataZoom: [
        { type: 'slider', xAxisIndex: 0 },
        { type: 'inside', xAxisIndex: 0 }
      ],
      xAxis: { 
        type: 'log', 
        name: 'Frequency (Hz)', // Eksen ismi ve birimi
        nameLocation: 'middle', // Eksenin ortasına yerleştir
        nameGap: 30,           // İsmin grafik alanından uzaklığı
        nameTextStyle: {
          fontWeight: 'bold',
          fontSize: 14
        }
      },
      yAxis: [
        { 
          name: 'Mag (dB)', 
          type: 'value',
          nameTextStyle: {
            fontWeight: 'bold',
            fontSize: 14
          },
          axisLine: { lineStyle: { color: '#5470c6' } }, // Mavi eksen
          axisLabel: { color: '#5470c6' } 
        },
        { 
          name: 'Phase (Deg)', 
          type: 'value', 
          position: 'right',
          nameTextStyle: {
            fontWeight: 'bold',
            fontSize: 14
          },
          axisLine: { lineStyle: { color: '#91cc75' } }, // Yeşil eksen
          axisLabel: { color: '#91cc75' } 
        }
      ],
      series: [
        { 
          name: 'Magnitude', 
          type: 'line', 
          data: this.mag.map((m, i) => [this.f[i], m]),
          itemStyle: { color: '#5470c6' } // Eksenle aynı mavi
        },
        { 
          name: 'Phase',     
          type: 'line', 
          data: this.pha.map((p, i) => [this.f[i], p]), 
          yAxisIndex: 1,
          itemStyle: { color: '#91cc75' } // Eksenle aynı yeşil
        }
      ]
    };
    this.cdr.detectChanges();
  }

  calculateResonance() {
    // Sadece 0. indekse bakmak yerine en yüksek kazancı (peak) bul
    const maxGain = Math.max(...this.mag); 
    const targetMag = maxGain - 3; // En tepeden 3dB aşağısı

    let resonanceFreq = 0;
    for (let i = 0; i < this.mag.length; i++) {
      // Kazanç tepe değerinden 3dB düştüğü anı yakala
      if (this.mag[i] <= targetMag) {
        resonanceFreq = this.f[i];
        console.log('Kesim İndeksi:', i, 'Frekans:', resonanceFreq);
        break; 
      }
    }
    this.resonanceFrequency = resonanceFreq;
  }

  openPhysicsDialog() {
    this.dialog.open(PhysicsInfoDialog, {
      width: '500px',
      disableClose: false 
    });
  }
}