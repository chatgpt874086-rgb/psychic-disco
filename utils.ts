export const generateUID = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generatePeriodId = (mode: 'FAST' | 'STD' | 'PRO'): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Create a unique index based on time and mode
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const totalSeconds = totalMinutes * 60 + date.getSeconds();
  
  let index;
  if (mode === 'FAST') {
      index = Math.floor(totalSeconds / 30); // Every 30s
  } else if (mode === 'PRO') {
      index = Math.floor(totalSeconds / 180); // Every 3m
  } else {
      index = totalMinutes; // Every 1m
  }

  return `${year}${month}${day}${mode === 'FAST' ? 'F' : mode === 'PRO' ? 'P' : 'S'}${index.toString().padStart(4, '0')}`;
};

export const calculateResultColors = (number: number): string[] => {
  if (number === 0) return ['red', 'violet'];
  if (number === 5) return ['green', 'violet'];
  if ([1, 3, 7, 9].includes(number)) return ['green'];
  return ['red'];
};

export const getResultColorClass = (colors: string[] | null) => {
    if (!colors) return 'bg-slate-700';
    if (colors.length === 2) return 'bg-gradient-to-r from-red-500 to-violet-500'; // 0
    if (colors.includes('violet') && colors.includes('green')) return 'bg-gradient-to-r from-green-500 to-violet-500'; // 5
    if (colors.includes('green')) return 'bg-emerald-500';
    if (colors.includes('red')) return 'bg-rose-500';
    return 'bg-slate-700';
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export const maskMobile = (mobile: string) => {
    if(!mobile) return '******';
    return mobile.slice(0, 2) + '******' + mobile.slice(8);
}