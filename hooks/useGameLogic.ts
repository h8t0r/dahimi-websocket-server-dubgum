
import { useState, useCallback } from 'react';
import { GameState, Player, Move, Card } from '../types/game';
import { 
  createDeck, 
  dealCards, 
  sortHand, 
  createInitialGameState, 
  isValidMove, 
  applyMove, 
  applyPass,
  findThreeOfSpades
} from '../utils/gameLogic';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const startPracticeGame = useCallback(() => {
    console.log('Starting practice game');
    const deck = createDeck();
    const hands = dealCards(deck, 4);
    
    const players: Player[] = hands.map((hand, index) => ({
      id: `player-${index}`,
      name: index === 0 ? 'You' : `AI ${index}`,
      hand: sortHand(hand),
      handCount: hand.length
    }));

    // Find who has 3 of spades and start with them
    let startingPlayerIndex = 0;
    for (let i = 0; i < players.length; i++) {
      if (findThreeOfSpades(players[i].hand)) {
        startingPlayerIndex = i;
        break;
      }
    }

    const initialState = createInitialGameState(players);
    initialState.currentPlayerIndex = startingPlayerIndex;
    
    setGameState(initialState);
    setSelectedCards([]);
  }, []);

  const playMove = useCallback((playerId: string, move: Move) => {
    if (!gameState) return false;

    const validation = isValidMove(gameState, playerId, move);
    if (!validation.valid) {
      console.log('Invalid move:', validation.error);
      return false;
    }

    const newState = applyMove(gameState, playerId, move);
    setGameState(newState);
    setSelectedCards([]);
    
    console.log('Move played successfully');
    return true;
  }, [gameState]);

  const passMove = useCallback((playerId: string) => {
    if (!gameState) return false;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      console.log('Not your turn');
      return false;
    }

    const newState = applyPass(gameState);
    setGameState(newState);
    
    console.log('Pass applied');
    return true;
  }, [gameState]);

  const toggleCardSelection = useCallback((card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        // Only allow cards of the same rank to be selected
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return [card]; // Start new selection
        }
        return [...prev, card];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const getCurrentPlayer = useCallback(() => {
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState]);

  const getHumanPlayer = useCallback(() => {
    if (!gameState) return null;
    return gameState.players.find(p => p.id === 'player-0') || null;
  }, [gameState]);

  return {
    gameState,
    selectedCards,
    startPracticeGame,
    playMove,
    passMove,
    toggleCardSelection,
    clearSelection,
    getCurrentPlayer,
    getHumanPlayer
  };
}
