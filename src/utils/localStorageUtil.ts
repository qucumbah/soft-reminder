import superjson from "superjson";

const read = <T>(key: string): T | null => {
  const stringifiedValue = localStorage.getItem(key);

  if (stringifiedValue === null) {
    return null;
  }

  return superjson.parse<T>(stringifiedValue);
};

const write = <T>(key: string, value: T) => {
  localStorage.setItem(key, superjson.stringify(value));
};

export const localStorageUtil = {
  read,
  write,
};
