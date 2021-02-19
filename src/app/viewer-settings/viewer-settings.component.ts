import { Component, Input, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { SetBrightness, SetContrast, SetSaturation } from '../app.actions';

@Component({
  selector: 'app-viewer-settings',
  templateUrl: './viewer-settings.component.html',
  styleUrls: ['./viewer-settings.component.css']
})
export class ViewerSettingsComponent implements OnInit {
  @Input() loadingProgress = 0;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {}

  changeBrightness($event: MatSliderChange): void {
    this.store.dispatch(new SetBrightness($event.value));
  }
  changeContrast($event: MatSliderChange): void {
    this.store.dispatch(new SetContrast($event.value));
  }
  changeSaturation($event: MatSliderChange): void {
    this.store.dispatch(new SetSaturation($event.value));
  }
}
