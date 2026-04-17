export interface CarMake {
  name: string;
  models: string[];
}

export const CAR_MAKES: CarMake[] = [
  { name: "Lada (ВАЗ)", models: ["Granta", "Vesta", "XRAY", "Largus", "Niva Travel", "Niva Legend", "2107", "2109", "2110", "2114", "2115", "Kalina", "Priora", "Другая"] },
  { name: "Toyota", models: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Land Cruiser Prado", "Hilux", "Fortuner", "Yaris", "C-HR", "Highlander", "Avalon", "Venza", "Другая"] },
  { name: "Hyundai", models: ["Solaris", "Creta", "Tucson", "Santa Fe", "Elantra", "i30", "i40", "Accent", "Sonata", "ix35", "Palisade", "Другая"] },
  { name: "Kia", models: ["Rio", "Sportage", "Cerato", "Sorento", "Optima", "K5", "Stinger", "Soul", "Seltos", "Carnival", "Другая"] },
  { name: "Volkswagen", models: ["Polo", "Golf", "Passat", "Tiguan", "Touareg", "Jetta", "Arteon", "T-Roc", "T-Cross", "Другая"] },
  { name: "BMW", models: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7", "1 Series", "2 Series", "4 Series", "6 Series", "Другая"] },
  { name: "Mercedes-Benz", models: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "B-Class", "CLA", "GLA", "GLB", "Другая"] },
  { name: "Audi", models: ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "TT", "Другая"] },
  { name: "Nissan", models: ["Qashqai", "X-Trail", "Juke", "Patrol", "Murano", "Pathfinder", "Almera", "Teana", "Sentra", "Micra", "Другая"] },
  { name: "Renault", models: ["Logan", "Sandero", "Duster", "Arkana", "Kaptur", "Megane", "Laguna", "Fluence", "Koleos", "Другая"] },
  { name: "Skoda", models: ["Octavia", "Superb", "Fabia", "Rapid", "Kodiaq", "Karoq", "Yeti", "Scala", "Kamiq", "Другая"] },
  { name: "Ford", models: ["Focus", "Mondeo", "Fiesta", "Kuga", "Explorer", "EcoSport", "Edge", "Fusion", "Mustang", "Другая"] },
  { name: "Mazda", models: ["3", "6", "CX-3", "CX-5", "CX-7", "CX-9", "CX-30", "MX-5", "Другая"] },
  { name: "Mitsubishi", models: ["Outlander", "ASX", "Eclipse Cross", "Pajero", "Pajero Sport", "L200", "Galant", "Lancer", "Другая"] },
  { name: "Subaru", models: ["Outback", "Forester", "Impreza", "Legacy", "XV", "WRX", "BRZ", "Другая"] },
  { name: "Honda", models: ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Jazz", "Fit", "Другая"] },
  { name: "Chevrolet", models: ["Cruze", "Captiva", "Trailblazer", "Niva", "Orlando", "Malibu", "Corvette", "Другая"] },
  { name: "Opel", models: ["Astra", "Insignia", "Mokka", "Zafira", "Antara", "Vectra", "Corsa", "Другая"] },
  { name: "Peugeot", models: ["206", "207", "208", "301", "307", "308", "408", "508", "2008", "3008", "4008", "5008", "Другая"] },
  { name: "Citroën", models: ["C3", "C4", "C5", "C3 Aircross", "C5 Aircross", "Berlingo", "Другая"] },
  { name: "Volvo", models: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "Другая"] },
  { name: "Land Rover", models: ["Range Rover", "Range Rover Sport", "Range Rover Evoque", "Discovery", "Discovery Sport", "Defender", "Freelander", "Другая"] },
  { name: "Lexus", models: ["IS", "ES", "GS", "LS", "NX", "RX", "GX", "LX", "Другая"] },
  { name: "Infiniti", models: ["Q50", "Q60", "Q70", "QX30", "QX50", "QX60", "QX70", "QX80", "Другая"] },
  { name: "Porsche", models: ["Cayenne", "Macan", "Panamera", "911", "Taycan", "Другая"] },
  { name: "Jeep", models: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Другая"] },
  { name: "Geely", models: ["Atlas", "Coolray", "Tugella", "Emgrand", "Monjaro", "Другая"] },
  { name: "Chery", models: ["Tiggo 4", "Tiggo 7", "Tiggo 8", "Tiggo 4 Pro", "Tiggo 7 Pro", "Arrizo 5", "Другая"] },
  { name: "Haval", models: ["F7", "F7x", "Jolion", "H9", "Dargo", "Другая"] },
  { name: "GAZ", models: ["Gazelle Next", "Gazelle Business", "Sobol", "Другая"] },
  { name: "UAZ", models: ["Patriot", "Hunter", "Pickup", "Буханка", "Другая"] },
  { name: "Другая марка", models: [] },
];

export const MAKE_NAMES = CAR_MAKES.map((m) => m.name);

export function getModels(make: string): string[] {
  return CAR_MAKES.find((m) => m.name === make)?.models ?? [];
}
