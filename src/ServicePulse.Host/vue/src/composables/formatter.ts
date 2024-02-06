export function useGetDayDiffFromToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = new Date(value.replace("Z", "")).getTime() - today.getTime();
  return Math.round(diff / 1000 / 60 / 60 / 24);
}
