import React from 'react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/Sidebar/input"
import { Label } from "../../../components/ui/Sidebar/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { baseurl } from "../../../config/baseurl"

export default function Settings() {
  const [config, setConfig] = React.useState({
    emailAddress: '',
    password: '',
    serverType: 'imap',
    incomingServer: '',
    incomingPort: '',
    outgoingServer: '',
    outgoingPort: '',
    useSSL: true
  })

  React.useEffect(() => {
    // Fetch existing configuration
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch(`${baseurl}/email/config`, {
          headers: {
            "x-access-token": `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch configuration');
        }

        const data = await response.json();
        if (data) {
          setConfig(data);
        }
      } catch (error) {
        console.error('Error fetching email config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save email configuration');
      return;
    }

    try {
      const response = await fetch(`${baseurl}/email/config`, {
        method: 'POST',
        headers: {
          "x-access-token": `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          userId: localStorage.getItem('userId')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      alert('Email configuration saved successfully');
    } catch (error) {
      console.error('Error saving email configuration:', error);
      alert(error instanceof Error ? error.message : 'Failed to save email configuration');
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Server Configuration</CardTitle>
          <CardDescription>Configure your email server settings to send and receive emails</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  value={config.emailAddress}
                  onChange={(e) => handleChange('emailAddress', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverType">Server Type</Label>
                <Select 
                  value={config.serverType}
                  onValueChange={(value) => handleChange('serverType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select server type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imap">IMAP</SelectItem>
                    <SelectItem value="pop3">POP3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomingServer">Incoming Mail Server</Label>
                <Input
                  id="incomingServer"
                  value={config.incomingServer}
                  onChange={(e) => handleChange('incomingServer', e.target.value)}
                  placeholder="imap.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomingPort">Incoming Port</Label>
                <Input
                  id="incomingPort"
                  value={config.incomingPort}
                  onChange={(e) => handleChange('incomingPort', e.target.value)}
                  placeholder="993"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outgoingServer">Outgoing Mail Server (SMTP)</Label>
                <Input
                  id="outgoingServer"
                  value={config.outgoingServer}
                  onChange={(e) => handleChange('outgoingServer', e.target.value)}
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outgoingPort">Outgoing Port</Label>
                <Input
                  id="outgoingPort"
                  value={config.outgoingPort}
                  onChange={(e) => handleChange('outgoingPort', e.target.value)}
                  placeholder="587"
                />
              </div>
            </div>

            <Button type="submit" className="mt-4">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
