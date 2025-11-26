import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OdjavaPage } from './odjava.page';

describe('OdjavaPage', () => {
  let component: OdjavaPage;
  let fixture: ComponentFixture<OdjavaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OdjavaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
