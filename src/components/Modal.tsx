import * as React from "react";
import { useEffect, useRef } from "react";

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = (props) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (props.isOpen && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
    if (!props.isOpen && dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [props.isOpen]);

  return (
    <div
      className={[
        "fixed w-screen h-full inset-0 bg-slate-900 duration-200 ease transition-opacity",
        props.isOpen
          ? "opacity-50 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <dialog
        ref={dialogRef}
        className={[
          "block p-0 max-w-[none] max-h-[none] bg-transparent",
          "absolute inset-0 m-auto",
          "translate-y-8 open:translate-y-0",
          "duration-200 ease transition-transform",
          "backdrop:bg-transparent", // Backdrop is troublesome to animate
        ].join(" ")}
        onClose={props.onClose}
        onCancel={props.onClose}
        onClick={props.onClose}
      >
        <div
          className="bg-transparent"
          onClick={(event) => event.stopPropagation()}
        >
          {props.children}
        </div>
      </dialog>
    </div>
  );
};
