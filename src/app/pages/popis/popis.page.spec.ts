import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopisPage } from './popis.page';

describe('PopisPage', () => {
  let component: PopisPage;
  let fixture: ComponentFixture<PopisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PopisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
