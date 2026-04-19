import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  sentences: string[];
  typingSpeed?: number;
  pauseBetween?: number;
  onComplete: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ sentences, typingSpeed = 30, pauseBetween = 1000, onComplete }) => {
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isFinished) return;

    if (currentSentenceIdx >= sentences.length) {
      setIsFinished(true);
      onComplete();
      return;
    }

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setDisplayedText('');
        setCharIndex(0);
        setCurrentSentenceIdx(prev => prev + 1);
      }, pauseBetween);
      return () => clearTimeout(timer);
    }

    const currentSentence = sentences[currentSentenceIdx];

    if (charIndex < currentSentence.length) {
      const char = currentSentence[charIndex];
      let currentDelay = typingSpeed + (Math.random() * 20 - 10);
      
      // Add slight rhythmic pause for punctuation
      if (['.', ',', '?', '—', '-'].includes(char)) {
        currentDelay += 150;
      }

      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCharIndex(prev => prev + 1);
      }, currentDelay);
      return () => clearTimeout(timer);
    } else {
      setIsPaused(true);
    }
  }, [charIndex, isPaused, currentSentenceIdx, sentences, typingSpeed, pauseBetween, isFinished, onComplete]);

  return (
    <div className="relative font-mono text-xl md:text-2xl max-w-2xl text-center min-h-[4rem]">
      {/* Red-stroked transparent ghost, offset beneath the white layer */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none select-none leading-relaxed"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(239,68,68,0.40)',
          transform: 'translate(1px, 1px)',
        }}
      >
        {displayedText}
      </div>
      {/* White base layer — sits on top */}
      <div className="relative text-white leading-relaxed">
        {displayedText}
        {!isFinished && <span className="animate-pulse border-r-2 border-white ml-1 pr-1" />}
      </div>
    </div>
  );
};
