import { useState, useRef } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { Card, Icon, Button } from '../common';

interface CodeInputCardProps {
  onCodeSubmit: (code: string) => void;
}

export function CodeInputCard({ onCodeSubmit }: CodeInputCardProps) {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[A-Z0-9]?$/i.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 8) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Submit on Enter key if code is complete
    if (e.key === 'Enter') {
      const fullCode = code.join('');
      if (fullCode.length === 9) {
        onCodeSubmit(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (pastedData.length <= 9) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);

      // Focus last filled input
      if (pastedData.length < 9) {
        inputRefs.current[pastedData.length]?.focus();
      } else {
        inputRefs.current[8]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 9) {
      onCodeSubmit(fullCode);
    }
  };

  return (
    <Card variant="glow" padding="lg">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="flex items-center justify-center mb-4 border size-14 bg-primary/10 rounded-xl text-primary border-primary/20">
          <Icon name="key" size="lg" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Enter Share Code</h2>
        <p className="text-sm text-gray-400">
          Enter the 9-digit code to receive files
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
              className="size-11 md:size-12 text-center text-xl md:text-2xl font-mono font-bold bg-[#0f2422] border border-border-dark-alt rounded-lg text-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none uppercase"
            />
            {(index === 2 || index === 5) && (
              <span className="px-1 text-2xl font-bold select-none text-primary/50">
                -
              </span>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        icon="arrow_forward"
        iconPosition="right"
        onClick={handleSubmit}
        disabled={code.join('').length !== 9}
      >
        Connect & Receive
      </Button>

      <div className="mt-6 rounded-lg p-4 bg-border-dark/30 border border-border-dark-alt">
        <div className="flex items-start gap-3">
          <Icon name="info" className="text-primary/60 mt-0.5 shrink-0" size="sm" />
          <div className="text-xs leading-relaxed text-gray-400">
            <p className="mb-1 font-medium text-gray-300">How it works:</p>
            <ul className="ml-3 space-y-1 list-disc">
              <li>Get the code from sender</li>
              <li>Enter to establish P2P connection</li>
              <li>Direct transfer - no server storage</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}