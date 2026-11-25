export type NominatimResult = {
  lat: string;
  lon: string;
  place_id: number;
  osm_type: string;
  osm_id: number;
  name?: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
};
