import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from 'nodemailer';
import Imap = require('imap');
import { simpleParser, ParsedMail } from 'mailparser';

const authorize = require('../middleware/auth.ts');

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

// Save email configuration
router.post('/config', authorize, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      emailAddress,
      password,
      serverType,
      incomingServer,
      incomingPort,
      outgoingServer,
      outgoingPort,
      useSSL
    } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Save to database (encrypted)
    await prisma.emailConfig.upsert({
      where: {
        userId: req.user.id
      },
      update: {
        emailAddress,
        password: Buffer.from(password).toString('base64'), // Basic encryption (use better encryption in production)
        serverType,
        incomingServer,
        incomingPort,
        outgoingServer,
        outgoingPort,
        useSSL
      },
      create: {
        userId: req.user.id,
        emailAddress,
        password: Buffer.from(password).toString('base64'),
        serverType,
        incomingServer,
        incomingPort,
        outgoingServer,
        outgoingPort,
        useSSL
      }
    });

    res.json({ message: 'Email configuration saved successfully' });
  } catch (error) {
    console.error('Error saving email config:', error);
    res.status(500).json({ error: 'Failed to save email configuration' });
  }
});

// Get email configuration
router.get('/config', authorize, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const config = await prisma.emailConfig.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (config) {
      // Decrypt password before sending
      config.password = Buffer.from(config.password, 'base64').toString();
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching email config:', error);
    res.status(500).json({ error: 'Failed to fetch email configuration' });
  }
});

// Fetch emails
router.get('/messages', authorize, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const config = await prisma.emailConfig.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!config) {
      res.status(400).json({ error: 'Email not configured' });
      return;
    }

    const password = Buffer.from(config.password, 'base64').toString();

    if (config.serverType === 'imap') {
      const imap = new Imap({
        user: config.emailAddress,
        password: password,
        host: config.incomingServer,
        port: parseInt(config.incomingPort),
        tls: config.useSSL
      });

      const messages: ParsedMail[] = [];

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err: Error | null, box: any) => {
          if (err) throw err;

          const fetch = imap.seq.fetch('1:*', {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: true
          });

          fetch.on('message', (msg: any, seqno: number) => {
            const email: Partial<ParsedMail> = {};

            msg.on('body', (stream: any, info: any) => {
              simpleParser(stream, (err: Error | null, parsed: ParsedMail) => {
                if (err) throw err;
                Object.assign(email, parsed);
              });
            });

            msg.once('end', () => {
              messages.push(email as ParsedMail);
            });
          });

          fetch.once('error', (err: Error) => {
            throw err;
          });

          fetch.once('end', () => {
            imap.end();
            res.json(messages);
          });
        });
      });

      imap.once('error', (err: Error) => {
        throw err;
      });

      imap.connect();
    } else {
      // Implement POP3 fetching here if needed
      res.status(400).json({ error: 'POP3 not implemented yet' });
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Send email
router.post('/send', authorize, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { to, subject, text } = req.body;
    const config = await prisma.emailConfig.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!config) {
      res.status(400).json({ error: 'Email not configured' });
      return;
    }

    const password = Buffer.from(config.password, 'base64').toString();

    const transporter = nodemailer.createTransport({
      host: config.outgoingServer,
      port: parseInt(config.outgoingPort),
      secure: config.useSSL,
      auth: {
        user: config.emailAddress,
        pass: password
      }
    });

    await transporter.sendMail({
      from: config.emailAddress,
      to,
      subject,
      text
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;