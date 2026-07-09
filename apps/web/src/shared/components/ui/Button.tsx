import type { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white",

    secondary:
      "border border-zinc-700 hover:bg-zinc-800 text-zinc-100"
  };

  return (
    <button
      {...props}
      className={`rounded-xl px-5 py-3 transition ${variants[variant]} ${className}`}
    />
  );
}