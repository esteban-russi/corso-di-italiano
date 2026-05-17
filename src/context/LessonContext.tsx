import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExerciseType } from "../types";

type LessonState = {
  selectedVerbs: string[];
  selectedExercises: ExerciseType[];
  errors: number;
  startTime: number | null;
  currentStep: number;
  totalSteps: number;
};

type LessonContextValue = LessonState & {
  setSelectedVerbs: (verbs: string[]) => void;
  setSelectedExercises: (exercises: ExerciseType[]) => void;
  addError: () => void;
  nextStep: () => void;
  startLesson: (verbs: string[], exercises: ExerciseType[]) => void;
  reset: () => void;
  isActive: boolean;
};

const initialState: LessonState = {
  selectedVerbs: [],
  selectedExercises: [],
  errors: 0,
  startTime: null,
  currentStep: 0,
  totalSteps: 0,
};

const LessonCtx = createContext<LessonContextValue>({
  ...initialState,
  setSelectedVerbs: () => {},
  setSelectedExercises: () => {},
  addError: () => {},
  nextStep: () => {},
  startLesson: () => {},
  reset: () => {},
  isActive: false,
});

export function useLesson() {
  return useContext(LessonCtx);
}

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LessonState>(initialState);

  const setSelectedVerbs = useCallback((verbs: string[]) => {
    setState((s) => ({ ...s, selectedVerbs: verbs }));
  }, []);

  const setSelectedExercises = useCallback((exercises: ExerciseType[]) => {
    setState((s) => ({ ...s, selectedExercises: exercises }));
  }, []);

  const addError = useCallback(() => {
    setState((s) => ({ ...s, errors: s.errors + 1 }));
  }, []);

  const nextStep = useCallback(() => {
    setState((s) => ({ ...s, currentStep: s.currentStep + 1 }));
  }, []);

  const startLesson = useCallback((verbs: string[], exercises: ExerciseType[]) => {
    setState({
      selectedVerbs: verbs,
      selectedExercises: exercises,
      errors: 0,
      startTime: Date.now(),
      currentStep: 0,
      totalSteps: exercises.length,
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isActive = state.startTime !== null && state.currentStep < state.totalSteps;

  return (
    <LessonCtx.Provider
      value={{
        ...state,
        setSelectedVerbs,
        setSelectedExercises,
        addError,
        nextStep,
        startLesson,
        reset,
        isActive,
      }}
    >
      {children}
    </LessonCtx.Provider>
  );
}
