// Converts "Tuesday 9am EST" to the next occurrence of that day/time
export const getNextScheduledDate = (scheduleStr) => {
  const days = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  
  const lower = scheduleStr.toLowerCase();
  const dayMatch = Object.keys(days).find(d => lower.includes(d));
  const hourMatch = lower.match(/(\d+)(am|pm)/);
  
  if (!dayMatch || !hourMatch) return null;
  
  let hour = parseInt(hourMatch[1]);
  const meridiem = hourMatch[2];
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  
  const now = new Date();
  const targetDay = days[dayMatch];
  const currentDay = now.getDay();
  
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && now.getHours() >= hour) daysUntil = 7;
  
  const scheduled = new Date(now);
  scheduled.setDate(scheduled.getDate() + daysUntil);
  scheduled.setHours(hour, 0, 0, 0);
  
  // Convert EST to UTC (EST = UTC-5, EDT = UTC-4)
  const estOffset = 5; // adjust to 4 during daylight saving
  scheduled.setHours(scheduled.getHours() + estOffset);
  
  return scheduled.toISOString();
};
