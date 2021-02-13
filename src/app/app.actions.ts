import { Action } from '@ngrx/store';

// actions: triggered by components to change the state of the app, via reducers

// set up action types
export enum LoadingActionTypes {
  SetProgress = '[View] Set Progress'
}
export enum AdjustmentsActionTypes {
  SetBrightness = '[Viewer Settings] Set Brightness',
  SetContrast = '[Viewer Settings] Set Contrast',
  SetSaturation = '[Viewer Settings] Set Saturation',
}

export class LoadingAction implements Action {
  type: string;
  value: number;
}
export class AdjustmentsAction implements Action {
  type: string;
  value: number;
}

// define specific actions
// change the state's loading progress value
export class SetProgress implements LoadingAction {
  readonly type = LoadingActionTypes.SetProgress;
  constructor(readonly value: number) {}
}
// change the state's brightness value
export class SetBrightness implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetBrightness;
  constructor(readonly value: number) {}
}
// change the state's contrast value
export class SetContrast implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetContrast;
  constructor(readonly value: number) {
  }
}
// change the state's saturation value
export class SetSaturation implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetSaturation;
  constructor(readonly value: number) {
  }
}

export type LoadingActions = SetProgress;
export type AdjustmentsActions = SetBrightness | SetContrast | SetSaturation;
