export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Address = {
  id: string;
  address: string;
  coordinates?: Coordinates;
};

export type Place = {
  id: string;
  name: string;
  coordinates: Coordinates;
  color: string;
  distance?: number;
};
