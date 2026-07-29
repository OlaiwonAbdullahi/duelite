import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function hex(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

export function fakeTxRef() {
  return `0x${hex(6)}...${hex(6)}`
}
