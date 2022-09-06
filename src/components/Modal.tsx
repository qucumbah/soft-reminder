import * as React from "react";
import { useEffect, useRef } from "react";

export const Modal: React.FC<{
  isOpen: boolean;
  onCancel: () => void;
  onClosingAnimationEnd?: () => void;
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
        "fixed w-screen h-full inset-0 bg-slate-900 bg-opacity-50 duration-200 ease transition-opacity backdrop-blur-[2px] z-50",
        props.isOpen
          ? "opacity-100 pointer-events-auto"
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
        onCancel={props.onCancel}
        onClose={() =>
          props.onClosingAnimationEnd &&
          setTimeout(props.onClosingAnimationEnd, 200)
        }
        onClick={props.onCancel}
      >
        <div
          className="bg-transparent"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="bg-white w-[calc(100vw_-_4rem)] max-w-sm p-8 rounded-xl inset-0 m-auto">
            {props.children}
          </div>
        </div>
      </dialog>
    </div>
  );
};
