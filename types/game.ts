
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 1-13 (1=Ace, 11=Jack, 12=Queen, 13=King)
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  handCount: number;
}

export interface TrickPlay {
  playerId: string;
  cards: Card[];
  timestamp: number;
}

export interface Trick {
  setSize: number;
  currentRank: number;
  capRank?: number;
  plays: TrickPlay[];
}

export interface GameState {
  players: Player[];
  turnOrder: string[];
  currentPlayerIndex: number;
  currentTrick: Trick;
  table: Card[];
  playedRanks: Record<number, number>; // rank -> count (0-4)
  lastValidPlayer?: string;
  gamePhase: 'WAITING' | 'IN_GAME' | 'FINISHED';
  passCount: number;
}

export interface Lobby {
  matchID: string;
  players: { id: string; name: string }[];
  leaderID: string;
  status: 'WAITING' | 'IN_GAME';
}

export type GameMode = 'PRACTICE' | 'MULTIPLAYER' | 'TUTORIAL';

export interface Move {
  cards: Card[];
}

export interface GameAction {
  type: 'PLAY_CARDS' | 'PASS_TURN' | 'START_GAME' | 'JOIN_LOBBY' | 'LEAVE_LOBBY';
  payload?: any;
}
