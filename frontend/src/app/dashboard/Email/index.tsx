import { Mail } from "./mail"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { baseurl } from "../../../config/baseurl"

export default function MailPage() {
    const layout = localStorage.getItem("react-resizable-panels:layout:mail")
    const collapsed = localStorage.getItem("react-resizable-panels:collapsed")
    const [emailConfig, setEmailConfig] = useState(null)
    const [emails, setEmails] = useState([])

    const defaultLayout = layout ? JSON.parse(layout) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed) : undefined

    useEffect(() => {
        // Fetch email configuration
        fetch(`${baseurl}/email/config/${localStorage.getItem('userId')}`, {
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(config => {
                setEmailConfig(config)
                // Fetch emails after getting config
                if (config) {
                    return fetch(`${baseurl}/email/messages/${localStorage.getItem('userId')}`, {
                        headers: {
                            "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        }
                    })
                }
            })
            .then(res => {
                if (res) {
                    return res.json()
                }
            })
            .then(data => {
                if (data) {
                    // Transform the email data to match our Mail type
                    const transformedEmails = data.map((email: any) => ({
                        id: email.messageId || Math.random().toString(),
                        name: email.from?.text || 'Unknown',
                        email: email.from?.value?.[0]?.address || 'unknown@email.com',
                        subject: email.subject || 'No Subject',
                        text: email.text || email.html || '',
                        date: email.date || new Date().toISOString(),
                        read: false,
                        labels: []
                    }))
                    setEmails(transformedEmails)
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error)
            })
    }, [])

    return (
        <>
            <div className="md:hidden">
                <img
                    src="/examples/mail-dark.png"
                    width={1280}
                    height={727}
                    alt="Mail"
                    className="hidden dark:block"
                />
                <img
                    src="/examples/mail-light.png"
                    width={1280}
                    height={727}
                    alt="Mail"
                    className="block dark:hidden"
                />
            </div>
            <div className="hidden flex-col md:flex">
                {!emailConfig ? (
                    <div className="flex flex-col gap-5 items-center justify-center h-screen">
                        <span>
                        Please configure your email settings first
                        </span>
                        <Link to="/settings">
                            <Button>
                                Configure
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <Mail
                        emailConfig={emailConfig}
                        mails={emails}
                        defaultLayout={defaultLayout}
                        defaultCollapsed={defaultCollapsed}
                        navCollapsedSize={4}
                    />
                )}
            </div>
        </>
    )
}
