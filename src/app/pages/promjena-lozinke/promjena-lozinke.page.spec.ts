import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromjenaLozinkePage } from './promjena-lozinke.page';

describe('PromjenaLozinkePage', () => {
  let component: PromjenaLozinkePage;
  let fixture: ComponentFixture<PromjenaLozinkePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PromjenaLozinkePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
