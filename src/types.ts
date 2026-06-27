/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Infrastructure' | 'Canteen & Hygiene' | 'Safety' | 'Connectivity';
export type Priority = 'Low' | 'Medium' | 'High';
export type StatusState = 'Pending' | 'In Progress' | 'Resolved';

export interface CampusReport {
  report_id: string;
  image_payload: string; // Base64 string or mock image url/placeholder
  description: string;
  building_tag: string;
  room_label?: string;   // Precise room number/landmark
  latitude?: number;     // Relative X coordinate (0-100) on map
  longitude?: number;    // Relative Y coordinate (0-100) on map
  category: Category;
  priority: Priority;
  status_state: StatusState;
  cluster_flag: boolean;
  created_at: number;    // Unix epoch milliseconds
  resolved_at?: number;  // Unix epoch milliseconds when resolved
}

export const CAMPUS_BUILDINGS = [
  "Hostel A",
  "Hostel B",
  "Tech Block",
  "Canteen",
  "Library",
  "Science Lab",
  "Main Auditorium"
];

export const CATEGORIES: Category[] = [
  'Infrastructure',
  'Canteen & Hygiene',
  'Safety',
  'Connectivity'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Infrastructure': '#5B7FBF',
  'Canteen & Hygiene': '#C77B3F',
  'Safety': '#A8434F',
  'Connectivity': '#4F9B8C'
};

export const PRIORITY_COLORS: Record<Priority, { text: string; bg: string; dot: string }> = {
  'Low': { text: '#2E9E5B', bg: '#E8F5EC', dot: '#2E9E5B' },
  'Medium': { text: '#E2A33D', bg: '#FBF0DC', dot: '#E2A33D' },
  'High': { text: '#D44C3F', bg: '#FBE4E1', dot: '#D44C3F' }
};

export const STATUS_COLORS: Record<StatusState, { text: string; bg: string }> = {
  'Pending': { text: '#1F5C99', bg: '#DCE9F2' },
  'In Progress': { text: '#E2A33D', bg: '#FBF0DC' },
  'Resolved': { text: '#2E9E5B', bg: '#E8F5EC' }
};

// Seed initial reports for robust demonstration
export const INITIAL_REPORTS: CampusReport[] = [
  {
    report_id: "rep-001",
    image_payload: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80",
    description: "Water cooler on 2nd floor Hostel B dripping continuously and creating a slip hazard.",
    building_tag: "Hostel B",
    room_label: "2nd Floor Corridor",
    latitude: 16.2,
    longitude: 71.5,
    category: "Infrastructure",
    priority: "Medium",
    status_state: "In Progress",
    cluster_flag: false,
    created_at: Date.now() - 3600000 * 24 * 2 // 2 days ago
  },
  {
    report_id: "rep-002",
    image_payload: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
    description: "Vite WiFi router under floor 1 lobby has no signal. Unable to connect.",
    building_tag: "Tech Block",
    room_label: "Lobby Router Shelf",
    latitude: 49.5,
    longitude: 76.2,
    category: "Connectivity",
    priority: "Medium",
    status_state: "Pending",
    cluster_flag: false,
    created_at: Date.now() - 3600000 * 5 // 5 hours ago
  },
  {
    report_id: "rep-003",
    image_payload: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
    description: "Cracked flooring Tiles in Block Canteen causing trip hazards right in front of the main counter.",
    building_tag: "Canteen",
    room_label: "Main Counter Entrance",
    latitude: 81.0,
    longitude: 69.1,
    category: "Canteen & Hygiene",
    priority: "High",
    status_state: "Resolved",
    cluster_flag: false,
    created_at: Date.now() - 3600000 * 48, // 48 hours ago
    resolved_at: Date.now() - 3600000 * 45  // Resolved 3 hours later
  },
  {
    report_id: "rep-004",
    image_payload: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    description: "Corridor light flickers violently on floor 3, causing headaches and poor visibility near room 302.",
    building_tag: "Hostel A",
    room_label: "Outside Room 302",
    latitude: 19.1,
    longitude: 34.2,
    category: "Infrastructure",
    priority: "Low",
    status_state: "Pending",
    cluster_flag: false,
    created_at: Date.now() - 3600000 * 1.5 // 1.5 hours ago
  },
  {
    report_id: "rep-005",
    image_payload: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    description: "Smoke detector chirping continuously at Hostel A first floor stairwell. Battery low.",
    building_tag: "Hostel A",
    room_label: "Stairwell Block A",
    latitude: 17.5,
    longitude: 36.8,
    category: "Safety",
    priority: "Low",
    status_state: "Pending",
    cluster_flag: false,
    created_at: Date.now() - 3600000 * 1.2 // 1.2 hours ago
  }
];
