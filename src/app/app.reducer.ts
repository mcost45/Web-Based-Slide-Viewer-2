import {ActionReducerMap, createSelector, MetaReducer} from '@ngrx/store';
import { AdjustmentsActionTypes, LoadingActionTypes, LoadingAction, AdjustmentsAction } from './app.actions';
import { environment } from '../environments/environment';

export interface LoadingState {
  progress: number;
}
export interface AdjustmentsState {
  brightness: number;
  contrast: number;
  saturation: number;
}
export interface AppState {
  loading: LoadingState;
  adjustments: AdjustmentsState;
}

const initialLoadingState: LoadingState = {
  progress: 0
};
const initialAdjustmentsState: AdjustmentsState = {
  brightness: 0,
  contrast: 0,
  saturation: 0
};

export function loadingReducer(state: LoadingState = initialLoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case LoadingActionTypes.SetProgress:
      return {
        progress: action.value
      };
    default:
      return state;
  }
}
export function adjustmentsReducer(state: AdjustmentsState = initialAdjustmentsState, action: AdjustmentsAction): AdjustmentsState {
  switch (action.type) {
    case AdjustmentsActionTypes.SetBrightness:
      return {
        brightness: action.value,
        contrast: state.contrast,
        saturation: state.saturation
      };
    case AdjustmentsActionTypes.SetContrast:
      return {
        brightness: state.brightness,
        contrast: action.value,
        saturation: state.saturation
      };
    case AdjustmentsActionTypes.SetSaturation:
      return {
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: action.value
      };
    default:
      return state;
  }
}

export const reducers: ActionReducerMap<AppState> = {
  loading: loadingReducer,
  adjustments: adjustmentsReducer
};

export const selectLoading = (state: AppState) => state.loading.progress;
export const selectBrightness = (state: AppState) => state.adjustments.brightness;
export const selectContrast = (state: AppState) => state.adjustments.contrast;
export const selectSaturation = (state: AppState) => state.adjustments.saturation;

export const metaReducers: MetaReducer<any>[] = !environment.production ? [] : [];
