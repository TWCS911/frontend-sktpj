import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarangKeluarComponent } from './barang-keluar.component';

describe('BarangKeluarComponent', () => {
  let component: BarangKeluarComponent;
  let fixture: ComponentFixture<BarangKeluarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarangKeluarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarangKeluarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
