"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  return (
    <span
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full cursor-pointer"
    >
      Sair
    </span>
  )
}
