import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicsInfoDialog } from './physics-info-dialog';

describe('PhysicsInfoDialog', () => {
  let component: PhysicsInfoDialog;
  let fixture: ComponentFixture<PhysicsInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhysicsInfoDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PhysicsInfoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
