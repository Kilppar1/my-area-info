import type { Place } from "./address";

export type Criteria = {
  criteria: string;
  ratingsEnabled: boolean;
};

export type CriterionResult = { criteria: string; places: Place[] };

export type CommuteTimes = {
  car: number;
  bike: number;
  walk: number;
};
