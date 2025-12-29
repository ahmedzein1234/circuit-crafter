// Canvas Store - stores the Konva stage reference for export and other operations

import { create } from 'zustand';
import type Konva from 'konva';

interface CanvasState {
  stageRef: Konva.Stage | null;
  setStageRef: (stage: Konva.Stage | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  stageRef: null,
  setStageRef: (stage) => set({ stageRef: stage }),
}));
