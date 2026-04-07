import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";

export const useDelayedNavigate = (delay = 600) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const delayedNavigate = useCallback(
    (to: string) => {
      setIsNavigating(true);
      setTimeout(() => {
        navigate(to);
        setIsNavigating(false);
      }, delay);
    },
    [navigate, delay]
  );

  return { delayedNavigate, isNavigating };
};
