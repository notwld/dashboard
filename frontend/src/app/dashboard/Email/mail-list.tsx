import { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../../../lib/utils"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Mail } from "./data"
import { useMail } from "./use-mail"

interface MailListProps {
  items: Mail[]
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail()

  if (mail.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (mail.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 p-4">
        <p>Error loading emails:</p>
        <p>{mail.error}</p>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No emails found
      </div>
    )
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
            )}
            onClick={() => {
              setMail({
                ...mail,
                selected: item.id,
              })
            }}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <div key={label} className="text-xs bg-secondary px-2 py-1 rounded">
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}