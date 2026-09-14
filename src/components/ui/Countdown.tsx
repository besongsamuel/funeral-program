import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate);
  if (target < now) {
    return <p className="text-sm text-memorial-600">Service has passed</p>;
  }

  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const minutes = differenceInMinutes(target, now) % 60;

  return (
    <div className="flex gap-4">
      {[
        { value: days, label: 'Days' },
        { value: hours, label: 'Hours' },
        { value: minutes, label: 'Minutes' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="rounded-xl border-2 border-gold-400 bg-memorial-50 px-4 py-3 font-serif text-2xl font-bold text-memorial-900">
            {item.value}
          </div>
          <p className="mt-1 text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
