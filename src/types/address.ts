export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Address = {
  id: string;
  address: string;
  coordinates?: Coordinates;
};
