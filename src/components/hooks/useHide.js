import { useState, useEffect, useCallback } from "react";

export default function useHide(ref, option = false) {
  const [isOpen, setIsOpen] = useState(false);
  const clientOutsideHandler = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setIsOpen(false);

      //execute optional function
      if(option) {
        option();
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", clientOutsideHandler);
    }
    return () => {
      document.removeEventListener("click", clientOutsideHandler);
    };
  }, [isOpen]);

  return [isOpen, setIsOpen ];
}
