import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerSettingsComponent } from './viewer-settings.component';

describe('ViewerSettingsComponent', () => {
  let component: ViewerSettingsComponent;
  let fixture: ComponentFixture<ViewerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
