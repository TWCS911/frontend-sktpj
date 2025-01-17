import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarangMasukComponent } from './barang-masuk.component';

describe('BarangMasukComponent', () => {
  let component: BarangMasukComponent;
  let fixture: ComponentFixture<BarangMasukComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarangMasukComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarangMasukComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
