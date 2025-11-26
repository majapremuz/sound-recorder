import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrisanjeRacunaPage } from './brisanje-racuna.page';

describe('BrisanjeRacunaPage', () => {
  let component: BrisanjeRacunaPage;
  let fixture: ComponentFixture<BrisanjeRacunaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BrisanjeRacunaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
