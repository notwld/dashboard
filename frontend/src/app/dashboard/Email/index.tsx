import { Mail } from "./mail"
import { accounts } from "./data"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../../components/ui/button"

export default function MailPage() {
    const layout = localStorage.getItem("react-resizable-panels:layout:mail")
    const collapsed = localStorage.getItem("react-resizable-panels:collapsed")
    const [emailConfig, setEmailConfig] = useState(null)

    const defaultLayout = layout ? JSON.parse(layout) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed) : undefined

    useEffect(() => {
        // Fetch email configuration
        fetch('/api/email/config')
            .then(res => res.json())
            .then(config => {
                setEmailConfig(config)
            })
            .catch(error => {
                console.error('Error fetching email config:', error)
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
                        accounts={accounts}
                        mails={[]}
                        defaultLayout={defaultLayout}
                        defaultCollapsed={defaultCollapsed}
                        navCollapsedSize={4}
                    />
                )}
            </div>
        </>
    )
}
