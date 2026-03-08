export interface TibiaCity {
  id: string;
  name: string;
  region: string;
  x: number; // percentage position on map image
  y: number;
  color: string;
  icon: string;
}

// Map image bounds (from tibia-map-data bounds.json + 128px padding)
// Image covers Tibia coords: X 31616-34176, Y 30848-32896
// To convert: x% = (tibiaX - 31616) / 2560 * 100
//             y% = (tibiaY - 30848) / 2048 * 100

export const TIBIA_CITIES: TibiaCity[] = [
  // Mainland
  { id: 'thais', name: 'Thais', region: 'Mainland', x: 29.4, y: 68.0, color: 'hsl(var(--primary))', icon: '🏰' },
  { id: 'carlin', name: 'Carlin', region: 'Mainland', x: 28.3, y: 45.6, color: 'hsl(210 80% 55%)', icon: '🏛️' },
  { id: 'venore', name: 'Venore', region: 'Mainland', x: 52.3, y: 60.0, color: 'hsl(142 70% 45%)', icon: '💰' },
  { id: 'ab_dendriel', name: "Ab'Dendriel", region: 'Mainland', x: 41.6, y: 37.8, color: 'hsl(120 60% 40%)', icon: '🌳' },
  { id: 'kazordoon', name: 'Kazordoon', region: 'Mainland', x: 39.5, y: 52.6, color: 'hsl(30 60% 45%)', icon: '⛏️' },
  { id: 'edron', name: 'Edron', region: 'Mainland', x: 62.5, y: 47.0, color: 'hsl(272 72% 50%)', icon: '🔮' },
  // Desert
  { id: 'darashia', name: 'Darashia', region: 'Desert', x: 62.4, y: 78.4, color: 'hsl(45 80% 50%)', icon: '🏜️' },
  { id: 'ankrahmun', name: 'Ankrahmun', region: 'Desert', x: 57.7, y: 89.5, color: 'hsl(35 70% 40%)', icon: '🏺' },
  // Tiquanda
  { id: 'port_hope', name: 'Port Hope', region: 'Tiquanda', x: 38.2, y: 92.6, color: 'hsl(160 50% 40%)', icon: '🌴' },
  { id: 'liberty_bay', name: 'Liberty Bay', region: 'Tiquanda', x: 26.1, y: 97.0, color: 'hsl(200 60% 50%)', icon: '⚓' },
  // Ice Islands
  { id: 'svargrond', name: 'Svargrond', region: 'Ice Islands', x: 23.3, y: 13.9, color: 'hsl(200 40% 70%)', icon: '❄️' },
  // Yalahar
  { id: 'yalahar', name: 'Yalahar', region: 'Mainland', x: 45.7, y: 20.4, color: 'hsl(0 50% 45%)', icon: '⚙️' },
  // Roshamuul area
  { id: 'gray_beach', name: 'Gray Beach', region: 'Roshamuul', x: 72.5, y: 17.3, color: 'hsl(0 0% 50%)', icon: '💀' },
  { id: 'roshamuul', name: 'Roshamuul', region: 'Roshamuul', x: 74.1, y: 54.0, color: 'hsl(280 40% 35%)', icon: '👹' },
  // Kilmaresh
  { id: 'issavi', name: 'Issavi', region: 'Kilmaresh', x: 89.2, y: 30.4, color: 'hsl(40 70% 55%)', icon: '🦁' },
  // Marapur
  { id: 'marapur', name: 'Marapur', region: 'Marapur', x: 84.3, y: 39.4, color: 'hsl(180 60% 45%)', icon: '🐚' },
  // Oramond
  { id: 'rathleton', name: 'Rathleton', region: 'Oramond', x: 77.3, y: 51.3, color: 'hsl(45 50% 45%)', icon: '🔧' },
  // Feyrist
  { id: 'feyrist', name: 'Feyrist', region: 'Feyrist', x: 76.0, y: 67.3, color: 'hsl(300 60% 60%)', icon: '🦋' },
  // Gnomprona
  { id: 'gnomprona', name: 'Gnomprona', region: 'Underground', x: 47.4, y: 29.4, color: 'hsl(100 40% 35%)', icon: '🍄' },
];

export const CITY_CONNECTIONS = [
  ['thais', 'venore'], ['thais', 'kazordoon'], ['kazordoon', 'ab_dendriel'],
  ['ab_dendriel', 'carlin'], ['edron', 'ab_dendriel'], ['venore', 'port_hope'],
  ['port_hope', 'liberty_bay'], ['darashia', 'ankrahmun'], ['edron', 'darashia'],
  ['yalahar', 'edron'], ['gray_beach', 'roshamuul'], ['carlin', 'svargrond'],
];

export const MAP_REGIONS = ['Mainland', 'Desert', 'Ice Islands', 'Tiquanda', 'Roshamuul', 'Kilmaresh'];
