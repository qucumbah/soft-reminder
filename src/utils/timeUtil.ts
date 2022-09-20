export const makeDateFuture = (date: Date) => {
  const now = new Date();

  date.setDate(now.getDate());

  if (date.getTime() < now.getTime()) {
    date.setDate(now.getDate() + 1);
  }

  return date;
};
