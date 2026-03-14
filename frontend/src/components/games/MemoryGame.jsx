import { useEffect, useMemo, useState } from 'react';

const EMOJIS = ['🎮', '🕹️', '👾', '🎯', '🏆', '⚡'];

const createDeck = () => {
  const cards = [...EMOJIS, ...EMOJIS]
    .map((emoji, index) => ({ id: `${emoji}-${index}`, emoji }))
    .sort(() => Math.random() - 0.5);
  return cards;
};

const MemoryGame = () => {
  const [deck, setDeck] = useState(createDeck());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const allMatched = matched.length === deck.length && deck.length > 0;

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped;

    if (deck[first].emoji === deck[second].emoji) {
      setMatched((prev) => [...prev, deck[first].id, deck[second].id]);
      setFlipped([]);
    } else {
      const timeout = setTimeout(() => setFlipped([]), 700);
      return () => clearTimeout(timeout);
    }
  }, [flipped, deck]);

  const handleFlip = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(deck[index].id)) return;
    setFlipped((prev) => [...prev, index]);
    if (flipped.length === 1) setMoves((prev) => prev + 1);
  };

  const resetGame = () => {
    setDeck(createDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const cardStates = useMemo(() => (
    deck.map((card, index) => ({
      ...card,
      isFlipped: flipped.includes(index) || matched.includes(card.id),
    }))
  ), [deck, flipped, matched]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>Moves: {moves}</span>
        <span>{allMatched ? 'You matched them all!' : 'Find all pairs'}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cardStates.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleFlip(index)}
            className={`h-16 w-16 rounded-xl border border-white/10 text-2xl flex items-center justify-center transition-all ${
              card.isFlipped ? 'bg-primary/20' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {card.isFlipped ? card.emoji : '❓'}
          </button>
        ))}
      </div>
      <button onClick={resetGame} className="btn-primary px-5 py-2 text-sm">
        Reset
      </button>
    </div>
  );
};

export default MemoryGame;