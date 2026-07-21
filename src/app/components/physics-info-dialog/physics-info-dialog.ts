import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-physics-info-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './physics-info-dialog.html',
  styleUrl: './physics-info-dialog.scss',
})
export class PhysicsInfoDialog {}
