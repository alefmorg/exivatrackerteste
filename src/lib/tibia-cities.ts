export interface TibiaCity {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  color: string;
  icon: string;
}

export const TIBIA_CITIES: TibiaCity[] = [
  { id: 'thais', name: 'Thais', region: 'Mainland', x: 30, y: 42, color: 'hsl(var(--primary))', icon: '🏰' },
  { id: 'carlin', name: 'Carlin', region: 'Mainland', x: 28, y: 18, color: 'hsl(210 80% 55%)', icon: '🏛️' },
  { id: 'venore', name: 'Venore', region: 'Mainland', x: 42, y: 48, color: 'hsl(142 70% 45%)', icon: '💰' },
  { id: 'ab_dendriel', name: "Ab'Dendriel", region: 'Mainland', x: 38, y: 22, color: 'hsl(120 60% 40%)', icon: '🌳' },
  { id: 'kazordoon', name: 'Kazordoon', region: 'Mainland', x: 35, y: 32, color: 'hsl(30 60% 45%)', icon: '⛏️' },
  { id: 'edron', name: 'Edron', region: 'Mainland', x: 52, y: 28, color: 'hsl(272 72% 50%)', icon: '🔮' },
  { id: 'darashia', name: 'Darashia', region: 'Desert', x: 68, y: 35, color: 'hsl(45 80% 50%)', icon: '🏜️' },
  { id: 'ankrahmun', name: 'Ankrahmun', region: 'Desert', x: 72, y: 50, color: 'hsl(35 70% 40%)', icon: '🏺' },
  { id: 'port_hope', name: 'Port Hope', region: 'Tiquanda', x: 55, y: 62, color: 'hsl(160 50% 40%)', icon: '🌴' },
  { id: 'liberty_bay', name: 'Liberty Bay', region: 'Tiquanda', x: 48, y: 72, color: 'hsl(200 60% 50%)', icon: '⚓' },
  { id: 'svargrond', name: 'Svargrond', region: 'Ice Islands', x: 18, y: 8, color: 'hsl(200 40% 70%)', icon: '❄️' },
  { id: 'yalahar', name: 'Yalahar', region: 'Mainland', x: 60, y: 12, color: 'hsl(0 50% 45%)', icon: '⚙️' },
  { id: 'gray_beach', name: 'Gray Beach', region: 'Roshamuul', x: 78, y: 18, color: 'hsl(0 0% 50%)', icon: '💀' },
  { id: 'roshamuul', name: 'Roshamuul', region: 'Roshamuul', x: 82, y: 25, color: 'hsl(280 40% 35%)', icon: '👹' },
  { id: 'issavi', name: 'Issavi', region: 'Kilmaresh', x: 85, y: 60, color: 'hsl(40 70% 55%)', icon: '🦁' },
  { id: 'marapur', name: 'Marapur', region: 'Marapur', x: 88, y: 42, color: 'hsl(180 60% 45%)', icon: '🐚' },
  { id: 'rathleton', name: 'Rathleton', region: 'Oramond', x: 15, y: 55, color: 'hsl(45 50% 45%)', icon: '🔧' },
  { id: 'feyrist', name: 'Feyrist', region: 'Feyrist', x: 22, y: 68, color: 'hsl(300 60% 60%)', icon: '🦋' },
  { id: 'gnomprona', name: 'Gnomprona', region: 'Underground', x: 10, y: 38, color: 'hsl(100 40% 35%)', icon: '🍄' },
];

export const CITY_CONNECTIONS = [
  ['thais', 'venore'], ['thais', 'kazordoon'], ['kazordoon', 'ab_dendriel'],
  ['ab_dendriel', 'carlin'], ['edron', 'ab_dendriel'], ['venore', 'port_hope'],
  ['port_hope', 'liberty_bay'], ['darashia', 'ankrahmun'], ['edron', 'darashia'],
  ['yalahar', 'edron'], ['gray_beach', 'roshamuul'], ['carlin', 'svargrond'],
];

export const MAP_REGIONS = ['Mainland', 'Desert', 'Ice Islands', 'Tiquanda', 'Roshamuul', 'Kilmaresh'];
