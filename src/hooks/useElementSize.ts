import React, { useEffect, useRef, useState } from "react";

export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    setSize({
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    });
  }, [ref]);

  return { ref, size };
};
