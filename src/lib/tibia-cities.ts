export interface TibiaCity {
  id: string;
  name: string;
  region: string;
  x: number; // percentage position on map image
  y: number;
  color: string;
  icon: string;
}

// Map image bounds — recalibrated to match tibia-world-map.png
// The image aspect ratio is ~2:1, covering a Y range smaller than originally assumed.

export const TIBIA_CITIES: TibiaCity[] = [
  // Mainland
  { id: 'thais', name: 'Thais', region: 'Mainland', x: 31.5, y: 78.0, color: 'hsl(var(--primary))', icon: '🏰' },
  { id: 'carlin', name: 'Carlin', region: 'Mainland', x: 28.0, y: 56.5, color: 'hsl(210 80% 55%)', icon: '🏛️' },
  { id: 'venore', name: 'Venore', region: 'Mainland', x: 52.0, y: 73.0, color: 'hsl(142 70% 45%)', icon: '💰' },
  { id: 'ab_dendriel', name: "Ab'Dendriel", region: 'Mainland', x: 41.0, y: 48.0, color: 'hsl(120 60% 40%)', icon: '🌳' },
  { id: 'kazordoon', name: 'Kazordoon', region: 'Mainland', x: 38.5, y: 63.0, color: 'hsl(30 60% 45%)', icon: '⛏️' },
  { id: 'edron', name: 'Edron', region: 'Mainland', x: 62.0, y: 57.0, color: 'hsl(272 72% 50%)', icon: '🔮' },
  // Desert
  { id: 'darashia', name: 'Darashia', region: 'Desert', x: 63.0, y: 88.0, color: 'hsl(45 80% 50%)', icon: '🏜️' },
  { id: 'ankrahmun', name: 'Ankrahmun', region: 'Desert', x: 58.0, y: 96.0, color: 'hsl(35 70% 40%)', icon: '🏺' },
  // Tiquanda
  { id: 'port_hope', name: 'Port Hope', region: 'Tiquanda', x: 39.0, y: 97.0, color: 'hsl(160 50% 40%)', icon: '🌴' },
  { id: 'liberty_bay', name: 'Liberty Bay', region: 'Tiquanda', x: 27.0, y: 99.0, color: 'hsl(200 60% 50%)', icon: '⚓' },
  // Ice Islands
  { id: 'svargrond', name: 'Svargrond', region: 'Ice Islands', x: 22.5, y: 24.0, color: 'hsl(200 40% 70%)', icon: '❄️' },
  // Yalahar
  { id: 'yalahar', name: 'Yalahar', region: 'Mainland', x: 46.0, y: 31.0, color: 'hsl(0 50% 45%)', icon: '⚙️' },
  // Roshamuul area
  { id: 'gray_beach', name: 'Gray Beach', region: 'Roshamuul', x: 73.0, y: 27.0, color: 'hsl(0 0% 50%)', icon: '💀' },
  { id: 'roshamuul', name: 'Roshamuul', region: 'Roshamuul', x: 74.0, y: 65.0, color: 'hsl(280 40% 35%)', icon: '👹' },
  // Kilmaresh
  { id: 'issavi', name: 'Issavi', region: 'Kilmaresh', x: 89.0, y: 42.0, color: 'hsl(40 70% 55%)', icon: '🦁' },
  // Marapur
  { id: 'marapur', name: 'Marapur', region: 'Marapur', x: 84.0, y: 50.0, color: 'hsl(180 60% 45%)', icon: '🐚' },
  // Oramond
  { id: 'rathleton', name: 'Rathleton', region: 'Oramond', x: 77.0, y: 62.0, color: 'hsl(45 50% 45%)', icon: '🔧' },
  // Feyrist
  { id: 'feyrist', name: 'Feyrist', region: 'Feyrist', x: 76.0, y: 76.0, color: 'hsl(300 60% 60%)', icon: '🦋' },
  // Gnomprona
  { id: 'gnomprona', name: 'Gnomprona', region: 'Underground', x: 47.0, y: 39.0, color: 'hsl(100 40% 35%)', icon: '🍄' },
];

export const CITY_CONNECTIONS = [
  ['thais', 'venore'], ['thais', 'kazordoon'], ['kazordoon', 'ab_dendriel'],
  ['ab_dendriel', 'carlin'], ['edron', 'ab_dendriel'], ['venore', 'port_hope'],
  ['port_hope', 'liberty_bay'], ['darashia', 'ankrahmun'], ['edron', 'darashia'],
  ['yalahar', 'edron'], ['gray_beach', 'roshamuul'], ['carlin', 'svargrond'],
];

export const MAP_REGIONS = ['Mainland', 'Desert', 'Ice Islands', 'Tiquanda', 'Roshamuul', 'Kilmaresh'];
