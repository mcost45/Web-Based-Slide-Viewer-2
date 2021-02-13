import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AdjustmentsActionTypes, LoadingActionTypes, LoadingAction, AdjustmentsAction } from './app.actions';
import { environment } from '../environments/environment';

// reducers: take an action and current state to determine next state
// at any time the apps state is represented by the union of the loading
// state (progress: 1 - 100) and the adjustments state
// (brightness/contrast/saturation: -100 - +100)

// interfaces for app sub-states
export interface LoadingState {
  progress: number;
}
export interface AdjustmentsState {
  brightness: number;
  contrast: number;
  saturation: number;
}
// interface for app state
export interface AppState {
  loading: LoadingState;
  adjustments: AdjustmentsState;
}

// set up initial states app begins in
const initialLoadingState: LoadingState = {
  progress: 0
};
const initialAdjustmentsState: AdjustmentsState = {
  brightness: 0,
  contrast: 0,
  saturation: 0
};

// map actions to state changes
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
