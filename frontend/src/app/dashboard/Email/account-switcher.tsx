"use client"

import * as React from "react"
import { cn } from "../../../lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select/select"
import { Mail, Settings } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useNavigate } from "react-router-dom"

interface AccountSwitcherProps {
  isCollapsed: boolean
  emailConfig: {
    emailAddress: string
  } | null
}

export function AccountSwitcher({
  isCollapsed,
  emailConfig,
}: AccountSwitcherProps) {
  const navigate = useNavigate()
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    emailConfig?.emailAddress || ''
  )

  if (!emailConfig) {
    return null;
  }

  const accounts = [{
    label: emailConfig.emailAddress.split('@')[0],
    email: emailConfig.emailAddress,
    icon: <Mail className="h-4 w-4" />
  }];

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
        <SelectTrigger
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            {accounts.find((account) => account.email === selectedAccount)?.icon}
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts.find((account) => account.email === selectedAccount)
                  ?.label
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.email} value={account.email}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {account.icon}
                {account.email}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}