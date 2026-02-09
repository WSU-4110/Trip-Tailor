export type Trip = {
  id: string
  title: string
  destination: string
  country: string
  description: string
  duration: string
  priceRange: string
  imageUrl: string
  highlights: string[]
  travelStyle: string
}

export const sampleTrips: Trip[] = [
  {
    id: '1',
    title: 'Tokyo & Kyoto Explorer',
    destination: 'Tokyo & Kyoto',
    country: 'Japan',
    description: 'Experience the perfect blend of ancient tradition and cutting-edge modernity. From Kyoto\'s serene temples to Tokyo\'s neon-lit streets, discover the soul of Japan.',
    duration: '10 days',
    priceRange: '$1,800 - $2,500',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    highlights: ['Temple visits in Kyoto', 'Tokyo street food tour', 'Bullet train experience', 'Traditional tea ceremony'],
    travelStyle: 'Cultural',
  },
  {
    id: '2',
    title: 'Santorini Sunset Escape',
    destination: 'Santorini',
    country: 'Greece',
    description: 'Unwind in the iconic whitewashed villages perched on volcanic cliffs. Stunning sunsets, crystal-clear waters, and world-class Mediterranean cuisine await.',
    duration: '5 days',
    priceRange: '$1,200 - $2,000',
    imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop',
    highlights: ['Oia sunset views', 'Wine tasting tour', 'Boat trip to volcanic islands', 'Caldera hiking'],
    travelStyle: 'Relaxation',
  },
  {
    id: '3',
    title: 'Patagonia Adventure',
    destination: 'Patagonia',
    country: 'Chile & Argentina',
    description: 'Trek through some of the most dramatic landscapes on Earth. Glacier hikes, turquoise lakes, and the legendary Torres del Paine await adventurous souls.',
    duration: '14 days',
    priceRange: '$2,500 - $3,500',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
    highlights: ['Torres del Paine trek', 'Perito Moreno Glacier', 'Penguin colonies', 'Stargazing in El Chaltén'],
    travelStyle: 'Adventure',
  },
  {
    id: '4',
    title: 'Amalfi Coast Paradise',
    destination: 'Amalfi Coast',
    country: 'Italy',
    description: 'Cruise along dramatic coastal roads, explore colorful cliffside villages, and indulge in authentic Italian cuisine with Mediterranean views.',
    duration: '7 days',
    priceRange: '$1,500 - $2,200',
    imageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=600&h=400&fit=crop',
    highlights: ['Positano & Ravello', 'Capri boat excursion', 'Lemon grove tour', 'Fresh seafood & pasta'],
    travelStyle: 'Luxury',
  },
  {
    id: '5',
    title: 'Iceland Ring Road',
    destination: 'Iceland',
    country: 'Iceland',
    description: 'Circle the Land of Fire and Ice. Waterfalls, geothermal pools, glaciers, and the Northern Lights—Iceland\'s natural wonders at every turn.',
    duration: '10 days',
    priceRange: '$2,000 - $3,000',
    imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=400&fit=crop',
    highlights: ['Blue Lagoon', 'Golden Circle', 'Jökulsárlón glacier lagoon', 'Northern Lights hunting'],
    travelStyle: 'Adventure',
  },
  {
    id: '6',
    title: 'Moroccan Souks & Sahara',
    destination: 'Marrakech & Sahara',
    country: 'Morocco',
    description: 'From bustling souks and ornate palaces to camel treks across golden dunes. Immerse yourself in the colors, scents, and hospitality of Morocco.',
    duration: '8 days',
    priceRange: '$900 - $1,400',
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=400&fit=crop',
    highlights: ['Marrakech medina', 'Sahara desert camping', 'Atlas Mountains', 'Traditional hammam'],
    travelStyle: 'Cultural',
  },
]
