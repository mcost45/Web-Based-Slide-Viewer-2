import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState, selectLoading, selectBrightness, selectContrast, selectSaturation } from '../app.reducer';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.scss']
})
export class PageContentComponent implements OnInit {
  loadingProgress$: Observable<number>;
  brightness$: Observable<number>;
  contrast$: Observable<number>;
  saturation$: Observable<number>;
  constructor(private store: Store<AppState>) {}
  ngOnInit(): void {
    this.loadingProgress$ = this.store.pipe(select(selectLoading));
    this.brightness$ = this.store.pipe(select(selectBrightness));
    this.contrast$ = this.store.pipe(select(selectContrast));
    this.saturation$ = this.store.pipe(select(selectSaturation));
  }

}
