import { FC } from "react";

interface ButtonProps {
  text: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ className, onClick, text, disabled }) => (
  <button className={`bg-red-400 rounded-xl text-md py-1 px-8 ${className}`} onClick={onClick} disabled={disabled}>
    {text}
  </button>
);
