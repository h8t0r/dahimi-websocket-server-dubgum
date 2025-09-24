
import { Card, GameState, Player, Trick, Move } from '../types/game';

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`
      });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number): Card[][] {
  const hands: Card[][] = Array(playerCount).fill(null).map(() => []);
  const cardsPerPlayer = Math.floor(deck.length / playerCount);
  
  for (let i = 0; i < cardsPerPlayer * playerCount; i++) {
    hands[i % playerCount].push(deck[i]);
  }
  
  return hands;
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}

export function findThreeOfSpades(hand: Card[]): Card | null {
  return hand.find(card => card.rank === 3 && card.suit === 'spades') || null;
}

export function isValidMove(gameState: GameState, playerId: string, move: Move): { valid: boolean; error?: string } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  const currentPlayerIndex = gameState.currentPlayerIndex;
  const currentPlayer = gameState.players[currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }

  const { cards } = move;
  if (cards.length === 0) {
    return { valid: false, error: 'Must play at least one card' };
  }

  // Check if player has all the cards
  for (const card of cards) {
    if (!player.hand.find(c => c.id === card.id)) {
      return { valid: false, error: 'Card not in hand' };
    }
  }

  // Check if all cards have the same rank
  const rank = cards[0].rank;
  if (!cards.every(card => card.rank === rank)) {
    return { valid: false, error: 'All cards must have the same rank' };
  }

  const { currentTrick } = gameState;
  
  // If starting a new trick
  if (currentTrick.plays.length === 0) {
    // First play of the game must include 3 of spades
    if (gameState.playedRanks[3] === 0) {
      const hasThreeOfSpades = cards.some(card => card.rank === 3 && card.suit === 'spades');
      if (!hasThreeOfSpades) {
        return { valid: false, error: 'First play must include 3 of spades' };
      }
    }
    return { valid: true };
  }

  // Check set size matches
  if (cards.length !== currentTrick.setSize) {
    return { valid: false, error: `Must play ${currentTrick.setSize} cards` };
  }

  // Check rank is valid
  const capRank = currentTrick.capRank || 13;
  if (rank > capRank) {
    return { valid: false, error: `Cannot play rank higher than ${capRank}` };
  }

  if (rank < currentTrick.currentRank) {
    return { valid: false, error: `Must play rank ${currentTrick.currentRank} or higher` };
  }

  return { valid: true };
}

export function applyMove(gameState: GameState, playerId: string, move: Move): GameState {
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const player = newState.players.find(p => p.id === playerId)!;
  const { cards } = move;

  // Remove cards from player's hand
  for (const card of cards) {
    const index = player.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  }
  player.handCount = player.hand.length;

  // Add to trick
  newState.currentTrick.plays.push({
    playerId,
    cards,
    timestamp: Date.now()
  });

  // Update trick state
  if (newState.currentTrick.plays.length === 1) {
    newState.currentTrick.setSize = cards.length;
  }
  
  const rank = cards[0].rank;
  newState.currentTrick.currentRank = rank;
  newState.lastValidPlayer = playerId;
  newState.passCount = 0;

  // Update played ranks count
  newState.playedRanks[rank] = (newState.playedRanks[rank] || 0) + cards.length;

  // Handle special rules
  if (rank === 2) {
    // 2s reset the trick
    newState.currentTrick = createNewTrick();
    newState.lastValidPlayer = playerId;
  } else if (rank === 8) {
    // 8s cap the rank
    newState.currentTrick.capRank = 8;
  } else if (newState.playedRanks[rank] === 4) {
    // Four of a kind wipes the table
    newState.currentTrick = createNewTrick();
    newState.lastValidPlayer = playerId;
  }

  // Move to next player
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;

  return newState;
}

export function applyPass(gameState: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
  newState.passCount++;
  
  // If 3 passes in a row, reset trick
  if (newState.passCount >= 3) {
    newState.currentTrick = createNewTrick();
    newState.passCount = 0;
    // Next leader is the last valid player
    if (newState.lastValidPlayer) {
      const lastValidIndex = newState.players.findIndex(p => p.id === newState.lastValidPlayer);
      if (lastValidIndex !== -1) {
        newState.currentPlayerIndex = lastValidIndex;
      }
    }
  } else {
    // Move to next player
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
  }

  return newState;
}

export function createNewTrick(): Trick {
  return {
    setSize: 0,
    currentRank: 0,
    plays: []
  };
}

export function createInitialGameState(players: Player[]): GameState {
  const playedRanks: Record<number, number> = {};
  for (let i = 1; i <= 13; i++) {
    playedRanks[i] = 0;
  }

  return {
    players,
    turnOrder: players.map(p => p.id),
    currentPlayerIndex: 0,
    currentTrick: createNewTrick(),
    table: [],
    playedRanks,
    gamePhase: 'IN_GAME',
    passCount: 0
  };
}

export function getCardDisplayName(card: Card): string {
  const rankNames: Record<number, string> = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K'
  };
  
  const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  const rankName = rankNames[card.rank] || card.rank.toString();
  const suitSymbol = suitSymbols[card.suit];
  
  return `${rankName}${suitSymbol}`;
}

export function getCardColor(card: Card): string {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? '#e53e3e' : '#2d3748';
}
