import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IzborJezikaPage } from './izbor-jezika.page';

describe('IzborJezikaPage', () => {
  let component: IzborJezikaPage;
  let fixture: ComponentFixture<IzborJezikaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IzborJezikaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
