import { ChangeEventHandler } from "react";

export const Checkbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <div className="relative w-6 h-6">
      <input
        type="checkbox"
        onChange={(event) => {
          onChange(event.target.checked);
          event.stopPropagation();
        }}
        checked={checked}
        className={[
          "relative appearance-none w-full h-full rounded bg-white border-2 peer cursor-pointer",
          "transition after:transition",
          "after:block after:absolute after:inset-0.5 after:rounded",
          "border-gray-400 after:bg-white",
          "checked:border-sky-500 checked:after:bg-sky-500",
        ].join(" ")}
      />
      <div
        className={[
          "absolute w-[85%] aspect-square rounded inset-0",
          "m-auto top-2 blur-sm bg-sky-500 -z-50",
          "transition-opacity opacity-0 peer-checked:opacity-75",
        ].join(" ")}
      ></div>
    </div>
  );
};
