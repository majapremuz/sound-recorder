import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopisLokacijaPage } from './popis-lokacija.page';

describe('PopisLokacijaPage', () => {
  let component: PopisLokacijaPage;
  let fixture: ComponentFixture<PopisLokacijaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PopisLokacijaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
