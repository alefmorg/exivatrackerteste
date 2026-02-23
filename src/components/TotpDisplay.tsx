import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';

interface TotpDisplayProps {
  secret: string;
}

export default function TotpDisplay({ secret }: TotpDisplayProps) {
  const [code, setCode] = useState('------');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!secret) {
      setCode('------');
      return;
    }

    const generateCode = () => {
      try {
        const totp = new OTPAuth.TOTP({
          secret: OTPAuth.Secret.fromBase32(secret),
          digits: 6,
          period: 30,
          algorithm: 'SHA1',
        });
        setCode(totp.generate());
        const now = Math.floor(Date.now() / 1000);
        setTimeLeft(30 - (now % 30));
      } catch {
        setCode('ERRO');
      }
    };

    generateCode();
    const interval = setInterval(generateCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  if (!secret) return null;

  const progress = (timeLeft / 30) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-lg font-bold tracking-widest ${isLow ? 'text-offline animate-pulse' : 'text-primary'}`}>
        {code.slice(0, 3)} {code.slice(3)}
      </span>
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke="currentColor" strokeWidth="2"
            className={isLow ? 'text-offline' : 'text-primary'}
            strokeDasharray={`${progress * 0.628} 62.8`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-muted-foreground">
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
