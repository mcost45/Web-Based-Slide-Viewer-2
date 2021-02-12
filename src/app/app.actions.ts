import { Action } from '@ngrx/store';

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

export class SetProgress implements LoadingAction {
  readonly type = LoadingActionTypes.SetProgress;
  constructor(readonly value: number) {}
}
export class SetBrightness implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetBrightness;
  constructor(readonly value: number) {}
}
export class SetContrast implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetContrast;
  constructor(readonly value: number) {
  }
}
export class SetSaturation implements AdjustmentsAction {
  readonly type = AdjustmentsActionTypes.SetSaturation;
  constructor(readonly value: number) {
  }
}

export type LoadingActions = SetProgress;
export type AdjustmentsActions = SetBrightness | SetContrast | SetSaturation;
