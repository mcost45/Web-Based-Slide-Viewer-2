import { AppConstants } from '../app.constants';
import { Component, OnInit, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-card',
  templateUrl: './loading-card.component.html',
  styleUrls: ['./loading-card.component.scss']
})
export class LoadingCardComponent implements OnInit, AfterViewInit {
  readonly DEFAULT_VMIC = AppConstants.DEFAULT_VMIC;

  @Input() loadingProgress = 0;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    document.getElementById('loading-text').innerHTML = 'Loading ' + this.DEFAULT_VMIC.toUpperCase() + '...';
  }
}
