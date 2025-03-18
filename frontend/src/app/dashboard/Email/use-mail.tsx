import { atom, useAtom } from "jotai"
import { useEffect, useState } from "react"
import { Mail } from "./data"
import { baseurl } from "../../../config/baseurl"

type Config = {
  selected: Mail["id"] | null
  emails: Mail[]
  loading: boolean
  error: string | null
}

const configAtom = atom<Config>({
  selected: null,
  emails: [],
  loading: false,
  error: null
})

export function useMail() {
  const [config, setConfig] = useAtom(configAtom)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      fetchEmails()
      setInitialized(true)
    }
  }, [initialized])

  const fetchEmails = async () => {
    setConfig(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await fetch(`${baseurl}/email/messages/${localStorage.getItem('userId')}`, {
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem('token')}`,
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }
      const data = await response.json()
      
      // Transform the email data to match our Mail type
      const emails = data.map((email: any) => ({
        id: email.messageId || Math.random().toString(),
        name: email.from?.text || 'Unknown',
        email: email.from?.value?.[0]?.address || 'unknown@email.com',
        subject: email.subject || 'No Subject',
        text: email.text || email.html || '',
        date: email.date || new Date().toISOString(),
        read: false,
        labels: []
      }))

      setConfig(prev => ({ 
        ...prev, 
        emails,
        selected: emails[0]?.id || null,
        loading: false 
      }))
    } catch (error) {
      setConfig(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch emails' 
      }))
    }
  }

  return [config, setConfig] as const
}