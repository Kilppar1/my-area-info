// Additional information about the service
export default function AboutPage() {
  return (
    // Main content of the About page
    <main>
      <h1>About the service</h1>

      <h2 className="about-intro-heading">
        <em>Explore the neighbourhood. Find your place.</em>
      </h2>

      <p>
        Discover what life could look like in a new area. Search for nearby
        amenities, explore your surroundings and compare neighbourhoods based on
        what matters most to you.
      </p>

      <p>
        Whether buying or renting, make a more informed decision about your next
        home.
      </p>
      <h2>How does it work?</h2>
      <p>
        Choose a home address, a search radius, and up to five place criteria.
        For each criterion, the service finds up to three of the closest
        matching places within your selected radius. You can optionally add a
        commute address to see estimated travel times.
      </p>
      <p>
        Explore the results on the map and in the list, show or hide criteria,
        and mark places as favourites. You can also export your search and
        import it again later.
      </p>
      <h2>Search speed</h2>
      <p>
        Address and place searches use Nominatim, free and open-source geocoding
        software powered by OpenStreetMap data. The public Nominatim service has
        usage limits, so requests are paced and searches may take a little
        longer, especially when several criteria are selected.
      </p>
      <p>Thank you for your patience!</p>
    </main>
  );
}
