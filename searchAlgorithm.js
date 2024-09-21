// searchAlgorithm.js

/**
 * Splits and parses the search term to identify key search parameters.
 * @param {string} search_term - The user's search string.
 * @returns {Object} Filter criteria parsed from the search term.
 */
const generateTerms = (search_term) => {
  // Split the search term into individual words
  const terms = search_term.split(" ");

  // Default search filter structure
  const terms_identifier = {
    budget: 0,
    property_type: "",
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 0,
    living_rooms: 0,
    inside_estate: false,
    square_footage: 0,
    city: "",
    state: "",
    estate: "",
    amenities: {
      pool: false,
      gym: false,
      garage: false,
      laundry_room: false,
    },
  };

  const keys = Object.keys(terms_identifier); // Filter keys (bedrooms, bathrooms, etc.)

  // Mapping for exception cases like synonyms or multi-word terms
  const exceptions = {
    living_rooms: ["living room", "living", "palour"],
  };

  const gotternTerms = []; // Track parsed terms

  // Iterate over the search filter keys
  keys.forEach((key) => {
    // Handle exceptions (synonyms)
    if (exceptions[key] != null) {
      exceptions[key].forEach((term) => {
        if (terms.includes(term)) {
          let index = terms.indexOf(term);
          terms_identifier[key] = parseInt(terms[index - 1]);
          gotternTerms.push(exceptions[key][0]);
        }
      });
    } else {
      // Regular parsing of search terms
      if (terms.includes(key)) {
        let index = terms.indexOf(key);
        terms_identifier[key] = parseInt(terms[index - 1]);
        gotternTerms.push(key);
      }
    }

    // Property type is assumed to be the last term
    if (key == "property_type") {
      terms_identifier[key] = terms[terms.length - 1];
    }
  });

  return { terms: gotternTerms, filter: terms_identifier };
};

/**
 * Calculates and ranks all properties based on the search filter and priority.
 * @param {Array} property_list - List of all properties.
 * @param {Object} search_filter - Filter criteria.
 * @param {Object} search_priority - Priority weights for ranking.
 * @returns {Array} Ranked list of properties.
 */
const GetAllPoints = (property_list, search_filter, search_priority) => {
  let property_points = [];

  // Iterate through each property and calculate points
  property_list.forEach((property) => {
    property_points.push(calculatedPropertyPoints(search_filter, search_priority, property));
  });

  return property_points;
};

/**
 * Calculates the points for a given property based on search filters and priorities.
 * @param {Object} search_filter - Filter criteria.
 * @param {Object} search_priority - Priority weights for ranking.
 * @param {Object} property_data - The property being evaluated.
 * @returns {number} Total points for the property.
 */
const calculatedPropertyPoints = (search_filter, search_priority, property_data) => {
  let totalPoints = 0;
  let priority_sum = Object.values(search_priority).reduce((a, b) => a + b, 0);

  // Calculate various points based on filters and priorities
  totalPoints += calculatePoint(search_filter.budget, property_data.price, search_priority.price);
  totalPoints += calculatePoint(search_filter.bedrooms, property_data.rooms.bedrooms, search_priority.bedroom_no);
  totalPoints += calculatePoint(search_filter.bathrooms, property_data.rooms.bathrooms, search_priority.bathroom_no);
  totalPoints += calculatePoint(search_filter.kitchens, property_data.rooms.kitchen, search_priority.kitchen_no);
  totalPoints += calculatePoint(search_filter.living_rooms, property_data.rooms.living_room, search_priority.living_room_no);
  totalPoints += calculatePoint(search_filter.square_footage, property_data.size.squ_foot, search_priority.square_footage);

  // Handle location matching (city, state, estate)
  let location_point = 0;
  if (search_filter.city === property_data.location.city) location_point += search_priority.location;
  if (search_filter.state === property_data.location.state) location_point += search_priority.location;
  if (search_filter.estate === property_data.location.estate) location_point += search_priority.location;

  totalPoints += (location_point / 3) * search_priority.location;

  // Calculate amenities points
  let amenities_points = 0;
  let possible_points = 0;
  for (let amenity in search_filter.amenities) {
    if (search_filter.amenities[amenity] && property_data.amenities[amenity]) {
      amenities_points++;
    }
    possible_points++;
  }
  totalPoints += (amenities_points / possible_points) * search_priority.amenities;

  // Inside estate point
  if (search_filter.inside_estate && property_data.location.inside_estate) {
    totalPoints += search_priority.inside_estate;
  }

  return totalPoints;
};

/**
 * Utility function to calculate the score based on requested and actual values.
 * @param {number} requested_value - The desired value from the filter.
 * @param {number} value - The actual value from the property.
 * @param {number} priority - The weight assigned to this parameter.
 * @returns {number} Points scored based on comparison.
 */
const calculatePoint = (requested_value, value, priority = 5) => {
  if (value < requested_value) {
    return (value / requested_value) * priority;
  } else if (value > requested_value) {
    return (requested_value / value) * priority;
  }
  return priority;
};

/**
 * Ranks all properties based on their calculated points.
 * @param {Array} property_list - The list of properties.
 * @returns {Array} Ranked list of properties.
 */
const GetBestChoice = (property_list) => {
  const points = GetAllPoints(property_list);
  const sortedPoints = [...points].sort((a, b) => b - a); // Sort points in descending order
  const sortedProperties = [];

  sortedPoints.forEach((point, index) => {
    let propertyIndex = points.indexOf(point);
    sortedProperties.push(property_list[propertyIndex]);
    console.log(`Property ${propertyIndex + 1}: ${Math.round(point)}% match`);
  });

  return sortedProperties;
};

// Export the functions to use them in index.js
module.exports = {
  generateTerms,
  GetBestChoice,
};
