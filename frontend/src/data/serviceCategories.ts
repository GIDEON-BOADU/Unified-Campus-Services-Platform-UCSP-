/**
 * Service categories data with images and descriptions
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  services: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'food-drinks',
    name: 'Food & Drinks',
    description: 'Fresh meals delivered to your hostel',
    icon: '🍔',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center',
    color: 'from-orange-400 to-orange-600',
    services: ['Pizza Delivery', 'Burgers', 'Chinese Food', 'African Cuisine', 'Beverages', 'Snacks']
  },
  {
    id: 'printing',
    name: 'Printing Services',
    description: 'Documents,lab reports, photos, and more',
    icon: '🖨️',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center',
    color: 'from-blue-400 to-blue-600',
    services: ['Document Printing', 'Photo Printing', 'Binding', 'Lamination', 'Scanning', 'Copying']
  },
  {
    id: 'beauty-grooming',
    name: 'Beauty & Grooming',
    description: 'Haircuts, nails, skincare, and more',
    icon: '💅',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=center',
    color: 'from-pink-400 to-pink-600',
    services: ['Haircuts', 'Nail Art', 'Facial Treatment', 'Massage', 'Makeup', 'Skincare']
  },
  {
    id: 'academic-support',
    name: 'Academic Support',
    description: 'Tutoring and study materials',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
    color: 'from-green-400 to-green-600',
    services: ['Tutoring', 'Study Groups', 'Assignment Help', 'Research Assistance', 'Note Taking', 'Exam Prep']
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Campus rides and delivery services',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center',
    color: 'from-purple-400 to-purple-600',
    services: ['Campus Rides', 'Airport Shuttle', 'Delivery Service', 'Bike Rental', 'Car Pool', 'Taxi Service']
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Tech support and device services',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center',
    color: 'from-indigo-400 to-indigo-600',
    services: ['Laptop Repair', 'Phone Repair', 'Software Installation', 'Data Recovery', 'Tech Support', 'Gaming Setup']
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Medical and fitness services',
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
    color: 'from-red-400 to-red-600',
    services: ['Medical Consultation', 'Fitness Training', 'Mental Health', 'Nutrition Advice', 'First Aid', 'Health Checkup']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Events, games, and leisure activities',
    icon: '🎮',
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop&crop=center',
    color: 'from-yellow-400 to-yellow-600',
    services: ['Gaming', 'Movie Nights', 'Party Planning', 'Music Events', 'Sports Activities', 'Social Events']
  },
  {
    id: 'gym-fitness',
    name: 'Gym & Fitness',
    description: 'Personal training and fitness services',
    icon: '💪',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    color: 'from-red-500 to-pink-500',
    services: ['Personal Training', 'Group Classes', 'Gym Membership', 'Fitness Consultation', 'Nutrition Planning', 'Workout Equipment']
  }
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id);
};

export const getCategoryByIcon = (icon: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.icon === icon);
};
