export interface UserDTO {
  id: number;
  username: string;
  email: string;
  // Add other fields as needed
}

export interface CountryTroopDTO {
  country: string;
  troops: number;
}

export interface GamePlayerDTO {
  id: any; // You can type this more strictly if you know the structure
  user: UserDTO;
  color: string;
  turnOrder: number;
  joinedAt: string;
  objective?: string;
  countries?: CountryTroopDTO[];
  // Add other fields as needed
}

export interface GameDTO {
  id: number;
  name: string;
  maxPlayers: number;
  status: string;
  createdAt: string;
  createdBy: UserDTO;
  players: GamePlayerDTO[];
} 