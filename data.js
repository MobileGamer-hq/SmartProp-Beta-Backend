//Data Models
export const User = {
    username: "",
    profile_picture: "",
    id: "",
    login: {
      email: "",
      password: "",
    },
    role: "",
    roleData: {},
    contact_info: {
      contact_phone_number: "",
      contact_email: "",
      address: "",
    },
    verification: {
      NIN: "",
      BVN: "",
      phone_number: "",
    },
  };
  
  export const Property = {
    id: "",
    seller: "",
    price: 0,
    type: "",
    description: {
      colors: [],
      pictures: [],
      tags: [],
    },
    verification: {
      verified: false,
      documents: [],
      verification_date: "",
    },
    legal_description: "",
    location: {
      address: "",
      city: "",
      state: "",
      zip: "",
      inside_estate: false,
      estate: "",
    },
    size: {
      squ_foot: 0,
      lot_size: 0,
      floors: 0,
    },
    rooms: {
      bedrooms: 0,
      bathrooms: 0,
      kitchen: 0,
      living_room: 0,
    },
    miscellaneous: [],
    amenities: {
      pool: false,
      gym: false,
      garage: false,
      laundry_room: false,
    },
    offers: [],
    note: "",
  };
  
  export const Search = {
    search_term: "",
    filter: {},
    results: [],
  };
  
  export const Search_Filter = {
    //
    budget: 0,
    property_type: "",
    bedroom_number: 0,
    bathroom_number: 0,
    kitchen_number: 0,
    living_room_number: 0,
  
  
    //
    inside_estate: false,
    square_footage: 0,
    city: "",
    state: "",
    estate: "",
  
  
    //
    amenities: {
        pool: true,
        gym: true,
        garage: false,
        laundry_room: true,
    },
  };
  
  export const Priority = {
    price: 5,
    bedroom_no: 3,
    bathroom_no: 3,
    living_room_no: 2,
    kitchen_no: 2,
    square_footage: 2,
    
    property_type: 2,
    location: 3,
    inside_estate: 2,
    amenities: 1,
  }
  
  //Types of users
  export const Seller = {
    properties: [],
    ads: [],
    rank: "",
    followers: [],
    rating: "",
  };
  
  export const Buyer = {
    watchlist: [],
    viewed_properties: [],
    following: [],
    priority: {
      price: 0,
      bedroom_no: 0,
      bathroom_no: 0,
      square_footage: 0,
      inside_estate: 0,
      property_type: 5,
      location: 0,
      amenities: 0,
    },
    search_filter: {},
    suggested: [],
  };
  
  export const Admin = {};