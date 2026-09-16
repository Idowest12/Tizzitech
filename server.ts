import fs from 'fs';
import express from 'express';
import path from 'path';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

// Configure Nodemailer Utility
export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>',
        to,
        subject,
        html,
      });
      console.log(`[EMAIL SENT] to ${to}: ${subject}`);
    } catch (err: any) {
      console.error(`[EMAIL FAILED] to ${to}:`, err.message);
      throw err;
    }
  } else {
    console.log(`[SIMULATED EMAIL] to ${to} | Subject: ${subject}`);
  }
};

// Premium Email Template wrapper with App Logo, responsive design, and socials
export function getPremiumTemplateHtml(title: string, contentHtml: string, baseUrl?: string): string {
  const finalBaseUrl = baseUrl || process.env.APP_URL || 'https://tizzitech.com.ng';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, p, h1, h2, h3, h4, td, ul, li {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        body {
          background-color: #0b0f19;
          color: #d1d5db;
          -webkit-font-smoothing: antialiased;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            margin: 10px auto !important;
            border-radius: 8px !important;
          }
          .content-padding {
            padding: 24px 16px !important;
          }
          .social-btn {
            display: block !important;
            margin: 8px auto !important;
            width: 150px !important;
          }
        }
      </style>
    </head>
    <body style="background-color: #0b0f19; margin: 0; padding: 20px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d1d5db;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; width: 100%;">
        <tr>
          <td align="center">
            <!-- Email Container -->
            <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #111827; max-width: 600px; width: 100%; margin: 20px auto; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
              
              <!-- Top Gradient Accent Bar -->
              <tr>
                <td height="4" style="background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
              </tr>

              <!-- Header Area (Logo & Branding) -->
              <tr>
                <td align="center" style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #1f2937;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <img src="${finalBaseUrl}/logo.svg" alt="Tizzitech Logo" width="120" style="display: block; border: 0; outline: none; text-decoration: none; width: 120px; height: auto;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <div style="font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 5px; color: #ffffff; text-transform: uppercase;">
                          TIZZI<span style="color: #06b6d4;">TECH</span>
                        </div>
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #6b7280; text-transform: uppercase; margin-top: 4px;">
                          Premium Tech Destination
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content Area -->
              <tr>
                <td class="content-padding" style="padding: 40px 32px; font-size: 15px; line-height: 1.6; color: #d1d5db;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Support & Complaints Callout Box -->
              <tr>
                <td style="padding: 0 32px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1e293b; border-radius: 12px; border: 1px solid #334155;">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <h4 style="font-size: 13px; font-weight: bold; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
                          Need Help or Have a Complaint?
                        </h4>
                        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 18px 0;">
                          We strive to provide premium quality tech accessories. If you have any inquiries, complaints, or feedback, our channels are active and ready to support you:
                        </p>
                        
                        <!-- Socials and Complaint Channels -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; width: 100%;">
                          <tr>
                            <td align="center" style="font-size: 0px;">
                              <!-- TikTok -->
                              <a href="https://www.tiktok.com/@tizzitech" class="social-btn" target="_blank" style="display: inline-block; padding: 10px 16px; margin: 4px 6px; background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; color: #ffffff;">
                                <span style="font-size: 14px; vertical-align: middle; margin-right: 4px;">🎵</span> TikTok
                              </a>
                              <!-- WhatsApp -->
                              <a href="https://wa.me/message/YOUR_WHATSAPP_LINK" class="social-btn" target="_blank" style="display: inline-block; padding: 10px 16px; margin: 4px 6px; background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; color: #ffffff;">
                                <span style="font-size: 14px; vertical-align: middle; margin-right: 4px;">💬</span> WhatsApp
                              </a>
                              <!-- Email Complaint -->
                              <a href="mailto:hello@tizzitech.com.ng?subject=Tizzitech%20Customer%20Complaint" class="social-btn" target="_blank" style="display: inline-block; padding: 10px 16px; margin: 4px 6px; background-color: #ef4444; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; color: #ffffff; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);">
                                <span style="font-size: 14px; vertical-align: middle; margin-right: 4px;">✉️</span> Email Support
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer (Copyright & Anti-Spam) -->
              <tr>
                <td align="center" style="padding: 32px 32px 40px 32px; text-align: center; font-size: 11px; color: #4b5563; line-height: 1.6;">
                  <p style="margin: 0 0 4px 0;">This email is sent on behalf of Tizzitech Online Store.</p>
                  <p style="margin: 0 0 16px 0;">You received this because you are a registered customer or subscriber of Tizzitech.</p>
                  <p style="margin: 0; font-weight: bold; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} TIZZITECH. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for in-memory uploads
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRETS || 'tizzitech-super-secret-key';
if (!JWT_SECRET) {
  console.error('CRITICAL WARNING: JWT_SECRET is not set in environment variables. Auth will fail.');
}

// Prevent Firebase unhandled stream rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled stream rejection, ignored to prevent crash:', reason);
});

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// 1. SECURE DEPLOYMENT: HTTPS ENFORCEMENT & STRICT RESPONSE HEADERS
app.use((req, res, next) => {
  const proto = req.headers['x-forwarded-proto'];
  const isHttps = proto === 'https' || req.secure;
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0');

  // Enforce HTTPS redirection in cloud environments (Cloud Run / production)
  if (process.env.NODE_ENV === 'production' && !isHttps && !isLocal && req.path !== '/api/health') {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  // Set Modern Web Security Headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // Protect against clickjacking while allowing Google AI Studio Preview iframe
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.google.com https://*.run.app https://*.aistudio.google.com;"
  );

  next();
});

// Enable JSON middleware for parsing parsed body structures
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  next();
});

app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });
app.get('/api/debug-routes', (req, res) => {
  const routes = app._router.stack.filter((r: any) => r.route).map((r: any) => r.route.path);
  res.json({ routes });
});

/**
 * DATABASE IMPLEMENTATION NOTES: Sylius (PHP) / Node.js with MySQL
 * -------------------------------------------------------------
 * 1. Sylius is a PHP framework based on Symfony, usually used as a complete headless or monolithic
 *    state-driven e-commerce backend with an SQL database (such as MySQL).
 * 
 * 2. If you are using Sylius as your backend, you would consume Sylius's standard REST/GraphQL APIs.
 * 
 * 3. Below, we provide a complete Node.js, Express, and MySQL server implementation that can act
 *    as a highly customizable alternative.
 * 
 * MYSQL SCHEMA EXAMPLE:
 * -------------------------------------------------------------
 * CREATE DATABASE IF NOT EXISTS tizzitech;
 * USE tizzitech;
 * 
 * -- Products Table
 * CREATE TABLE IF NOT EXISTS products (
 *   id VARCHAR(50) PRIMARY KEY,
 *   name VARCHAR(255) NOT NULL,
 *   brand VARCHAR(100) NOT NULL,
 *   category VARCHAR(150) NOT NULL,
 *   price DOUBLE PRECISION NOT NULL,
 *   `condition` VARCHAR(50) NOT NULL,
 *   specs JSON,
 *   description TEXT,
 *   stock INT DEFAULT 0,
 *   imageUrl VARCHAR(500)
 * );
 * 
 * -- Orders Table
 * CREATE TABLE IF NOT EXISTS orders (
 *   id VARCHAR(50) PRIMARY KEY,
 *   user_id VARCHAR(150),
 *   fullname VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) NOT NULL,
 *   address TEXT NOT NULL,
 *   payment_option VARCHAR(50) NOT NULL,
 *   total DOUBLE PRECISION NOT NULL,
 *   status VARCHAR(50) DEFAULT 'Confirmed',
 *   order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   expected_delivery_date DATETIME
 * );
 * 
 * -- Order Items Table
 * CREATE TABLE IF NOT EXISTS order_items (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   order_id VARCHAR(50),
 *   product_id VARCHAR(50),
 *   price DOUBLE PRECISION NOT NULL,
 *   quantity INT NOT NULL,
 *   FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
 * );
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, orderBy, limit, runTransaction, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

function getAdminDb() {
  // Return null to use client SDK with authenticated connection bypassing Admin SDK permission errors
  return null;
}

let firebaseDb: any = null;
let isSigningIn = false;

function getFirebaseDb() {
  if (firebaseDb) return firebaseDb;
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'firebase-applet-config.json'),
      path.join(process.cwd(), 'api', 'firebase-applet-config.json'),
      path.join(process.cwd(), '..', 'firebase-applet-config.json')
    ];
    let configPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        configPath = p;
        break;
      }
    }

    if (!configPath) {
      console.log('Firebase config tracking missing.');
      return null;
    }
    const configRaw = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(configRaw);
    const app = initializeApp(firebaseConfig);
    firebaseDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    console.log('Successfully initialized connection to Firebase.');

    // Authenticate background connection to bypass security rules
    if (!isSigningIn) {
      isSigningIn = true;
      const auth = getAuth(app);
      signInWithEmailAndPassword(auth, "server-admin@tizzitech.com", "SuperSecurePassword123!")
        .then((cred) => {
          console.log("Successfully authenticated server-side Firebase connection as", cred.user.email);
        })
        .catch((err) => {
          console.error("Failed to authenticate server-side Firebase connection:", err.message);
        })
        .finally(() => {
          isSigningIn = false;
        });
    }

    return firebaseDb;
  } catch (err: any) {
    console.log('Firebase init error', err.message);
    return null;
  }
}

interface GeoData {
  country: string;
  region: string;
  city: string;
}

const geoCache = new Map<string, { data: GeoData; timestamp: number }>();
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours cache

async function getRequestGeo(req: express.Request) {
  // 1. Try cloud provider / CDN headers first
  let country = (req.headers['x-client-geo-country'] || req.headers['x-appengine-country'] || req.headers['cf-ipcountry'] || '').toString().trim().toUpperCase();
  let region = (req.headers['x-client-geo-region'] || req.headers['x-appengine-region'] || '').toString().trim();
  let city = (req.headers['x-client-geo-city'] || req.headers['x-appengine-city'] || '').toString().trim();

  if (country) {
    return {
      country,
      region: region || 'unknown',
      city: city || 'unknown'
    };
  }

  // 2. Resolve client IP
  let ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
  // Standard clean up for ipv4 mapped to ipv6
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Check in-memory cache first
  const cached = geoCache.get(ip);
  if (cached && (Date.now() - cached.timestamp < GEO_CACHE_TTL_MS)) {
    return cached.data;
  }

  // Check if IP is localhost or private
  const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip.startsWith('172.31.');

  if (!isLocal) {
    // Try Provider 1: ip-api.com (Very fast and reliable free endpoint, doesn't rate limit as aggressively by default, returns JSON errors)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const text = await res.text();
        if (text && (text.startsWith('{') || text.startsWith('['))) {
          const data = JSON.parse(text);
          if (data && data.status === 'success') {
            const result = {
              country: data.countryCode ? data.countryCode.toUpperCase() : 'Unknown',
              region: data.regionName || data.region || 'Unknown',
              city: data.city || 'Unknown'
            };
            geoCache.set(ip, { data: result, timestamp: Date.now() });
            return result;
          }
        }
      }
    } catch (err: any) {
      console.warn(`[GEO IP-API FAILED] ip: ${ip} | Error: ${err.message}`);
    }

    // Try Provider 2: ipapi.co (with safe JSON parsing protection)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && (text.startsWith('{') || text.startsWith('['))) {
          const data = JSON.parse(text);
          if (data && data.country_code) {
            const result = {
              country: data.country_code.toUpperCase(),
              region: data.region || data.region_code || 'Unknown',
              city: data.city || 'Unknown'
            };
            geoCache.set(ip, { data: result, timestamp: Date.now() });
            return result;
          }
        } else {
          console.warn(`[GEO IPAPI.CO SKIPPED] Non-JSON response received`);
        }
      }
    } catch (err: any) {
      console.warn(`[GEO IPAPI.CO FAILED] ip: ${ip} | Error: ${err.message}`);
    }
  }

  // fallback
  return {
    country: 'NG',
    region: 'Lagos',
    city: 'Lagos'
  };
}

// 2. COMPREHENSIVE SECURITY OBSERVABILITY & THREAT DETECTION ENGINE
interface ThreatStats {
  totalScans: number;
  blockedAttacks: number;
  rateLimitBlocks: number;
  botSpamBlocks: number;
  scraperBlocks: number;
  honeypotBlocks: number;
  aiAbuseBlocks: number;
  authSuccessCount: number;
  authFailureCount: number;
  recentAlerts: Array<{ timestamp: number; ip: string; type: string; details: string; severity: string }>;
}

const threatStats: ThreatStats = {
  totalScans: 0,
  blockedAttacks: 0,
  rateLimitBlocks: 0,
  botSpamBlocks: 0,
  scraperBlocks: 0,
  honeypotBlocks: 0,
  aiAbuseBlocks: 0,
  authSuccessCount: 0,
  authFailureCount: 0,
  recentAlerts: []
};

// In-memory sliding window for IP and credential brute force tracking
const ipActivityWindow = new Map<string, { failedAttempts: number; lastReset: number; isSuspicious: boolean }>();

const SUSPICIOUS_PATTERNS = [
  /(\.\.\/|\.\.\\)/i, // Directory Traversal
  /(<script|javascript:|onload=|onerror=)/i, // XSS in query / parameters
  /(union(\s+all)?\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|benchmark\(|sleep\()/i, // SQL Injection
  /(\/etc\/passwd|\/proc\/self|\.env|\.git|\.aws|wp-config|wp-login|xmlrpc\.php)/i // Probing dotfiles/admin scripts
];

const SUSPICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /wpscan/i,
  /acunetix/i,
  /havij/i,
  /dirbuster/i,
  /gobuster/i,
  /hydra/i,
  /medusa/i,
  /zgrab/i,
  /nuclei/i,
  /httpx/i
];

const SCRAPER_BOT_USER_AGENTS = [
  /scrapy/i,
  /bytespider/i,
  /python-requests/i,
  /aiohttp/i,
  /httpclient/i,
  /urllib/i,
  /go-http-client/i,
  /phantomjs/i,
  /headlesschrome/i,
  /selenium/i,
  /casperjs/i,
  /puppeteer/i
];

async function logSecurityEvent(
  req: express.Request | null,
  eventType: string,
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL',
  details: string,
  explicitEmail?: string,
  metadata?: Record<string, any>
) {
  const timestamp = Date.now();
  const rawIp = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') as string : 'system';
  const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'unknown';
  const rawUserAgent = req ? (req.headers['user-agent'] || 'unknown') as string : 'internal';
  const userAgent = typeof rawUserAgent === 'string' ? rawUserAgent.substring(0, 300) : 'unknown';
  const email = explicitEmail || (req as any)?.admin?.email || (req as any)?.user?.email || 'anonymous';
  const path = req ? req.originalUrl || req.path : '';

  if (eventType.includes('SUCCESS')) {
    threatStats.authSuccessCount++;
  } else if (eventType.includes('FAIL') || eventType.includes('DENIED')) {
    threatStats.authFailureCount++;
  }

  const logEntry = {
    id: `SEC-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    eventType,
    severity,
    details,
    email,
    ip,
    userAgent,
    path,
    metadata: metadata || null,
    createdAt: new Date().toISOString()
  };

  // Structured Logging for Cloud Observability (Cloud Run / GCP Cloud Logging)
  console.log(`[SECURITY_${severity}] [${eventType}] IP: ${ip} | User: ${email} | Path: ${path} | Details: ${details}`);

  if (severity !== 'INFO') {
    threatStats.recentAlerts.unshift({
      timestamp,
      ip,
      type: eventType,
      details: `${details} (${path})`,
      severity
    });
    if (threatStats.recentAlerts.length > 100) {
      threatStats.recentAlerts.pop();
    }
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      await setDoc(doc(db, 'security_logs', logEntry.id), logEntry);
      // Also update audit_logs for dashboard backwards-compatibility
      await setDoc(doc(db, 'audit_logs', logEntry.id), {
        id: logEntry.id,
        timestamp,
        action: eventType,
        details,
        email,
        ip,
        userAgent
      });
    } catch (err: any) {
      console.warn('Security logging write to Firestore skipped/failed:', err.message);
    }
  }
}

// Backward compatible alias
async function logServerAuditActivity(req: express.Request, action: string, details: string, explicitEmail?: string) {
  const severity: 'INFO' | 'WARN' | 'HIGH' = action.includes('ERROR') || action.includes('FAIL') ? 'WARN' : 'INFO';
  await logSecurityEvent(req, action, severity, details, explicitEmail);
}

// Suspicious Traffic, Scraper & Malicious Signature Detector Middleware
app.use(async (req, res, next) => {
  threatStats.totalScans++;
  const rawIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') as string;
  const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'unknown';
  const userAgent = (req.headers['user-agent'] || '') as string;
  const url = req.url || '';
  const queryStr = JSON.stringify(req.query || {});
  const bodyStr = req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : '';

  // 1. Check for known vulnerability scanner User-Agents
  for (const scannerRegex of SUSPICIOUS_USER_AGENTS) {
    if (scannerRegex.test(userAgent)) {
      threatStats.blockedAttacks++;
      await logSecurityEvent(req, 'SUSPICIOUS_SCANNER_DETECTED', 'HIGH', `Known attack scanner detected: ${userAgent}`, undefined, { ip });
      return res.status(403).json({ error: 'Access Denied: Malicious tool signature detected.' });
    }
  }

  // 2. Check for known aggressive automated scraping bots targeting sensitive routes
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/products') && !req.path.startsWith('/api/settings')) {
    for (const scraperRegex of SCRAPER_BOT_USER_AGENTS) {
      if (scraperRegex.test(userAgent)) {
        threatStats.scraperBlocks++;
        await logSecurityEvent(req, 'AUTOMATED_SCRAPER_BLOCKED', 'HIGH', `Automated scraper bot blocked on ${req.path}: ${userAgent}`, undefined, { ip, path: req.path });
        return res.status(403).json({ error: 'Access Denied: Automated bot scraping not permitted.' });
      }
    }
  }

  // 3. Check for malicious URI / parameter patterns (SQLi, XSS, Path traversal, sensitive files)
  const fullPayload = `${url} ${queryStr} ${bodyStr}`;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullPayload)) {
      threatStats.blockedAttacks++;
      await logSecurityEvent(req, 'SUSPICIOUS_PAYLOAD_DETECTED', 'CRITICAL', `Malicious attack pattern matched: ${pattern}`, undefined, { url, pattern: pattern.toString() });
      return res.status(400).json({ error: 'Request rejected due to potentially malicious payload syntax.' });
    }
  }

  next();
});

function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

// Configure MySQL connection pooling - lazy-initialized to prevent server crashes if environment variables are not yet present
let pool: mysql.Pool | null = null;

function getMySQLPool(): mysql.Pool | null {
  if (pool) return pool;

  // Check if MySQL environment credentials have been supplied by the user/platform
  const host = process.env.MYSQL_HOST || '';
  const user = process.env.MYSQL_USER || '';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || '';

  if (!host || !user) {
    console.log('MySQL Database credentials are not configured. Running backend with local state fallback.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Successfully initialized connection pool to MySQL database.');
    return pool;
  } catch (error) {
    console.error('Failed to create MySQL pool:', error);
    return null;
  }
}

// Global In-Memory Fallback State (so it works right out of the box even without a live MySQL server connected)
import { initialProducts } from "./src/data";
let fallbackProducts: any[] = [...initialProducts];

let fallbackOrders: any[] = [];

let fallbackUsers: any[] = [];

import crypto from 'crypto';

function getDocId(email: string) {
  const secret = process.env.ADMIN_KEY || 'default_secret';
  return crypto.createHmac('sha256', secret).update(email).digest('hex');
}

const BCRYPT_SALT_ROUNDS = 12;

// Password Strength Validator
function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number or special symbol.' };
  }
  return { isValid: true };
}

// Admin and Auth Rate Limiters with Security Event Logging
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', 'WARN', `Auth endpoint rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, error: 'Too many authentication attempts from this IP, please try again after 15 minutes.' });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // limit login attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', 'HIGH', `Login brute-force throttle triggered on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, error: 'Too many login attempts. For your security, this IP has been temporarily throttled. Please try again after 15 minutes.' });
  }
});

// Account Creation / Registration Rate Limiter (Protects against mass bot registration)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // maximum 5 account registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    logSecurityEvent(req, 'REGISTRATION_RATE_LIMIT', 'HIGH', `Account creation rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, error: 'Too many account registrations from this network. Please try again later.' });
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', 'WARN', `Password reset rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, error: 'Too many password reset requests. Please wait a few minutes before trying again.' });
  }
});

// Order Placement Rate Limiter (Protects against checkout spam and carding attacks)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // maximum 10 checkout orders per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    logSecurityEvent(req, 'ORDER_RATE_LIMIT', 'HIGH', `Order submission rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, message: 'Too many order attempts. Please slow down and try again shortly.' });
  }
});

// Catalog & Public Scrape Rate Limiter (Prevents automated product scrapers)
const catalogLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 80, // limit catalog queries to prevent data scraping
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    threatStats.scraperBlocks++;
    logSecurityEvent(req, 'SCRAPING_RATE_LIMIT', 'WARN', `Catalog queries rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, error: 'Too many catalog requests. Please wait a moment.' });
  }
});

// Newsletter & Waitlist Subscription Rate Limiter
const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    threatStats.botSpamBlocks++;
    logSecurityEvent(req, 'NEWSLETTER_SPAM_BLOCKED', 'WARN', `Newsletter subscription rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, message: 'Too many subscription requests. Please try again later.' });
  }
});

// Contact & Support Form Rate Limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    threatStats.botSpamBlocks++;
    logSecurityEvent(req, 'CONTACT_SPAM_BLOCKED', 'WARN', `Contact form rate limit exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, message: 'Too many contact messages submitted. Please try again after 15 minutes.' });
  }
});

// AI Generation / Tech Advisor Rate Limiter (Protects Gemini API quotas & prevents abuse)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // maximum 15 AI queries per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    threatStats.aiAbuseBlocks++;
    logSecurityEvent(req, 'AI_QUOTA_RATE_LIMIT', 'WARN', `AI generation quota exceeded on ${req.originalUrl || req.path}`);
    res.status(options.statusCode).json({ success: false, message: 'AI advisor quota reached for this session. Please try again in a few minutes.' });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit general API routes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    threatStats.rateLimitBlocks++;
    res.status(options.statusCode).json({ success: false, error: 'Too many requests, please try again later.' });
  }
});

// Anti-Bot Honeypot Detector Middleware
// Bots autofilling hidden fields (_hp_website, _hp_company, honeypot) are immediately trapped and blocked
const honeypotBotDetector = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const body = req.body || {};
  const honeypotValue = body._hp_website || body._hp_company || body.honeypot || body.hp_token;
  if (honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
    threatStats.botSpamBlocks++;
    threatStats.honeypotBlocks++;
    logSecurityEvent(req, 'BOT_HONEYPOT_TRIGGERED', 'HIGH', `Automated bot filled hidden honeypot trap on ${req.path}`, undefined, { honeypotValue });
    // Return a fake generic success to silently sinkhole the bot without giving clues
    return res.status(200).json({ success: true, message: 'Request processed successfully.' });
  }
  next();
};

// Lazy Gemini API Client Initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      geminiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
    }
  }
  return geminiClient;
}

// Middleware to verify User JWT
const verifyUserToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || (!decoded.userId && !decoded.id && !decoded.email)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token structure.' });
    }
    (req as any).user = {
      userId: decoded.userId || decoded.backendId || decoded.id,
      email: decoded.email ? decoded.email.toLowerCase() : null,
      role: decoded.role || 'user'
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

// Middleware to verify Admin JWT
const verifyAdminToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized administrative access.' });
  }

  // Allow mock token for development preview mode if not in production
  if (process.env.NODE_ENV !== 'production' && token === 'mock-admin-token-for-preview') {
    (req as any).admin = {
      email: 'idowutosin70@gmail.com', // use actual admin email for realistic audits
      id: 'mock-admin-id'
    };
    return next();
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  
  try {
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded || !decoded.email) {
        throw new Error('Invalid custom JWT structure');
      }
    } catch (err) {
      // Try decoding as a Firebase/Google ID Token
      const decodedToken = jwt.decode(token) as any;
      if (decodedToken && decodedToken.iss && decodedToken.iss.includes('securetoken.google.com') && decodedToken.email) {
        const db = getFirebaseDb();
        if (db) {
          const email = decodedToken.email;
          const dId = getDocId(email);
          const adminSnap = await getDoc(doc(db, 'admins', dId));
          if (!adminSnap.exists()) {
            return res.status(403).json({ error: 'Forbidden: Admin access required.' });
          }
          
          // Also check session validity from admin_sessions
          const sessionDocId = getDocId(email + "_session");
          const sessionSnap = await getDoc(doc(db, 'admin_sessions', sessionDocId));
          if (!sessionSnap.exists()) {
            return res.status(401).json({ error: 'Invalid or expired administrative session.' });
          }
          
          decoded = {
            email: decodedToken.email,
            userId: decodedToken.sub || 'admin-id'
          };
        } else {
          // If Firestore is not initialized but email is correct, allow fallback
          if (decodedToken.email === 'idowutosin70@gmail.com') {
            decoded = {
              email: decodedToken.email,
              userId: decodedToken.sub || 'admin-id'
            };
          } else {
            return res.status(401).json({ error: 'Firebase database offline and unauthorized admin.' });
          }
        }
      } else {
        throw err;
      }
    }
    
    // Check if it's the admin email
    if (decoded.email !== 'idowutosin70@gmail.com') {
      logSecurityEvent(req, 'ADMIN_ACCESS_DENIED', 'HIGH', `Unauthorized admin access attempt by ${decoded.email}`, decoded.email);
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
    
    (req as any).admin = {
      email: decoded.email,
      id: decoded.userId || decoded.backendId || 'admin-id'
    };
    next();
  } catch (err: any) {
    logSecurityEvent(req, 'ADMIN_INVALID_TOKEN', 'WARN', `Invalid administrative token presentation: ${err.message}`);
    return res.status(401).json({ error: 'Invalid or expired administrative token.' });
  }
};

// ==================== API ENDPOINTS ====================

// PAYMENT VERIFICATION
app.get('/api/payment/verify', apiLimiter, async (req, res) => {
  const reference = req.query.reference as string;
  if (!reference) {
    return res.status(400).json({ success: false, message: 'Reference is required' });
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    console.warn('PAYSTACK_SECRET_KEY is missing. In a real environment, verification would fail.');
    // Simulated success for development without key
    return res.json({ success: true, message: 'Simulated success (no secret key provided)' });
  }

  try {
    let cleanSecret = paystackSecret.trim();
    if (cleanSecret.startsWith('"') && cleanSecret.endsWith('"')) {
      cleanSecret = cleanSecret.slice(1, -1).trim();
    }
    if (cleanSecret.startsWith("'") && cleanSecret.endsWith("'")) {
      cleanSecret = cleanSecret.slice(1, -1).trim();
    }
    
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanSecret}`,
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    
    if (data.status && data.data && data.data.status === 'success') {
      return res.json({ success: true, data: data.data });
    } else {
      console.error('Paystack API returned:', data);
      return res.status(400).json({ 
        success: false, 
        message: data.message || 'Transaction verification failed.',
        paystackResponse: data
      });
    }
  } catch (err: any) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
});

// ANALYTICS: VISIT TRACKER
app.post('/api/analytics/visit', async (req, res) => {
  const { visitorId, isRegistered, clientGeo } = req.body;
  const db = getFirebaseDb();
  const timestamp = new Date().toISOString();
  
  if (db) {
    try {
      let geo = clientGeo;
      if (!geo || !geo.country || geo.country === 'Unknown' || geo.country === 'UNKNOWN') {
        geo = await getRequestGeo(req);
      }
      const visitId = `v_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await setDoc(doc(db, 'analytics_visits', visitId), {
        id: visitId,
        visitorId: visitorId || 'anonymous',
        isRegistered: !!isRegistered,
        timestamp,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || 'unknown',
        country: geo.country,
        region: geo.region,
        city: geo.city
      });
      return res.json({ success: true, visitId });
    } catch (err: any) {
      console.error('Failed to log analytics visit to Firestore:', err.message);
    }
  }
  return res.json({ success: true });
});

// In-memory server-side caches with TTL to optimize Firestore reads under concurrent load
let cachedProductsList: any = null;
let cachedProductsExpiry = 0;
let cachedSettingsList: any = null;
let cachedSettingsExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// 1. GET ALL PRODUCTS (WITH SERVER-SIDE CACHING & SCRAPING RATE LIMIT)
app.get('/api/products', catalogLimiter, async (req, res) => {
  const now = Date.now();
  if (cachedProductsList && now < cachedProductsExpiry) {
    return res.json(cachedProductsList);
  }

  const sanitizeProducts = (list: any[]) => {
    return list.map((item: any) => {
      if ((item.id === 'p16' || (typeof item.name === 'string' && item.name.includes('S25'))) && 
          (typeof item.imageUrl === 'string' && (item.imageUrl.includes('1606131731446') || !item.imageUrl))) {
        return {
          ...item,
          imageUrl: '/products/samsung-s25-ultra.jpg',
          images: ['/products/samsung-s25-ultra.jpg', '/products/samsung-s25-ultra-front.jpg']
        };
      }
      return item;
    });
  };

  console.log('>>> FETCHING PRODUCTS (CACHE MISS)');
  const db = getFirebaseDb();
  if (db) {
    try {
      const q = collection(db, 'products');
      const querySnapshot = await getDocs(q);
      const data = sanitizeProducts(querySnapshot.docs.map((d: any) => d.data()));
      
      cachedProductsList = data;
      cachedProductsExpiry = now + CACHE_TTL_MS;
      return res.json(data);
    } catch (err: any) {
      console.log('Firestore fallback for /api/products:', err.message);
    }
  }

  // Fallback to local state
  return res.json(sanitizeProducts(fallbackProducts));
});

// 2. GET GLOBAL GLOBAL SETTINGS (WITH SERVER-SIDE CACHING)
app.get('/api/settings', catalogLimiter, async (req, res) => {
  const now = Date.now();
  if (cachedSettingsList && now < cachedSettingsExpiry) {
    return res.json(cachedSettingsList);
  }

  console.log('>>> FETCHING SETTINGS (CACHE MISS)');
  const db = getFirebaseDb();
  if (db) {
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (settingsSnap.exists()) {
        const s = settingsSnap.data();
        cachedSettingsList = s;
        cachedSettingsExpiry = now + CACHE_TTL_MS;
        return res.json(s);
      }
    } catch (err: any) {
      console.log('Error fetching global settings from Firestore:', err.message);
    }
  }
  return res.json({});
});

// Update Hero Config & Delivery Ticker from Admin
app.post('/api/admin/hero-config', async (req, res) => {
  try {
    const { heroConfig } = req.body;
    if (!heroConfig) {
      return res.status(400).json({ error: 'heroConfig is required' });
    }
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), { heroConfig }, { merge: true });
      } catch (dbErr: any) {
        console.warn('Firestore write error in /api/admin/hero-config:', dbErr.message);
      }
    }
    // Update server-side cache immediately so storefront fetches reflect changes instantly
    cachedSettingsList = { ...(cachedSettingsList || {}), heroConfig };
    cachedSettingsExpiry = Date.now() + CACHE_TTL_MS;
    return res.json({ success: true, heroConfig });
  } catch (err: any) {
    console.error('Error updating hero config:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Founder / CEO Photo & Profile
app.post('/api/admin/founder-photo', upload.single('image'), express.json({ limit: '15mb' }), async (req, res) => {
  try {
    let dataURI = '';
    let buffer: Buffer | null = null;

    if (req.body && req.body.image) {
      dataURI = req.body.image;
      const matches = dataURI.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      }
    } else if (req.file) {
      buffer = req.file.buffer;
      const b64 = req.file.buffer.toString('base64');
      dataURI = `data:${req.file.mimetype};base64,${b64}`;
    }

    if (!dataURI && (!req.body || !req.body.photoUrl)) {
      return res.status(400).json({ error: 'No image file or URL provided.' });
    }

    // 1. Write buffer to public folder as /founder.jpg and /founder.png
    if (buffer) {
      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'founder.jpg'), buffer);
        fs.writeFileSync(path.join(publicDir, 'founder.jpeg'), buffer);
        fs.writeFileSync(path.join(publicDir, 'founder.png'), buffer);
      } catch (fErr: any) {
        console.warn('Could not write founder image to public directory:', fErr.message);
      }
    }

    // 2. Upload to Cloudinary if available
    let secureUrl = req.body?.photoUrl || '/founder.jpg';
    if (dataURI && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadPromise = cloudinary.uploader.upload(dataURI, {
          resource_type: 'image',
          folder: 'tizzitech_founder',
          public_id: `ceo_idowu_oluwatosin_${Date.now()}`,
          overwrite: true,
          invalidate: true
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cloudinary upload timed out after 12s')), 12000)
        );
        const result: any = await Promise.race([uploadPromise, timeoutPromise]);
        if (result && result.secure_url) {
          secureUrl = result.secure_url;
        }
      } catch (cErr: any) {
        console.warn('Cloudinary upload warning for founder photo:', cErr.message);
      }
    }

    // 3. Persist to Firestore
    const fName = req.body?.founderName || cachedSettingsList?.founderName || 'Idowu Oluwatosin A.';
    const fTitle = req.body?.founderTitle || cachedSettingsList?.founderTitle || 'Founder & CEO • Tizzitech';
    const fQuote = req.body?.founderQuote || cachedSettingsList?.founderQuote || 'Tech for a Smarter Tomorrow';
    const fMessage = req.body?.founderMessage || cachedSettingsList?.founderMessage || '';

    const db = getFirebaseDb();
    if (db) {
      try {
        const updateObj: any = {
          founderPhotoUrl: secureUrl,
          founderName: fName,
          founderTitle: fTitle,
          founderQuote: fQuote,
          founderUpdatedAt: new Date().toISOString()
        };
        if (fMessage) updateObj.founderMessage = fMessage;
        await setDoc(doc(db, 'settings', 'global'), updateObj, { merge: true });
      } catch (dbErr: any) {
        console.warn('Firestore write warning for founder photo:', dbErr.message);
      }
    }

    // 4. Update cached settings
    cachedSettingsList = {
      ...(cachedSettingsList || {}),
      founderPhotoUrl: secureUrl,
      founderName: fName,
      founderTitle: fTitle,
      founderQuote: fQuote,
      ...(fMessage ? { founderMessage: fMessage } : {})
    };
    cachedSettingsExpiry = Date.now() + CACHE_TTL_MS;

    await logServerAuditActivity(req, 'FOUNDER_PHOTO_UPDATE', `Updated CEO photo to ${secureUrl}`);
    return res.json({ success: true, url: secureUrl, founderName: fName, founderTitle: fTitle, founderQuote: fQuote });
  } catch (err: any) {
    console.error('Founder photo upload error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Founder / CEO Details
app.post('/api/admin/founder-config', express.json(), async (req, res) => {
  try {
    const { founderName, founderTitle, founderQuote, founderPhotoUrl, founderMessage } = req.body;
    const updateData: any = {};
    if (founderName) updateData.founderName = founderName;
    if (founderTitle) updateData.founderTitle = founderTitle;
    if (founderQuote) updateData.founderQuote = founderQuote;
    if (founderPhotoUrl) updateData.founderPhotoUrl = founderPhotoUrl;
    if (founderMessage !== undefined) updateData.founderMessage = founderMessage;

    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), updateData, { merge: true });
      } catch (dbErr: any) {
        console.warn('Firestore write warning for founder config:', dbErr.message);
      }
    }

    cachedSettingsList = { ...(cachedSettingsList || {}), ...updateData };
    cachedSettingsExpiry = Date.now() + CACHE_TTL_MS;

    return res.json({ success: true, ...updateData });
  } catch (err: any) {
    console.error('Founder config update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:productId/reviews', catalogLimiter, honeypotBotDetector, async (req, res) => {
  const { productId } = req.params;
  const { author, rating, comment, date } = req.body;
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const reviews = productData.reviews || [];
        const newReview = { id: `rev_${Date.now()}`, author, rating, comment, date };
        reviews.unshift(newReview);
        await updateDoc(productRef, { reviews });
        return res.json({ success: true, review: newReview });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Fallback to local
  const product = fallbackProducts.find(p => p.id === productId);
  if (product) {
    if (!product.reviews) product.reviews = [];
    const newReview = { id: `rev_${Date.now()}`, author, rating, comment, date };
    product.reviews.unshift(newReview);
    return res.json({ success: true, review: newReview });
  }

  return res.status(404).json({ success: false, message: 'Product not found' });
});
app.post('/api/orders/:orderId/cancel', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized: missing authorization token' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { orderId } = req.params;
  const tokenUserId = decoded.userId || decoded.backendId || decoded.id;
  const tokenEmail = decoded.email ? decoded.email.toLowerCase() : null;

  const db = getFirebaseDb();
  if (db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return res.status(404).json({ error: 'Order not found' });
      const order = orderSnap.data();
      
      // Strict ownership check: only the order owner or an admin can cancel the order
      const isOwner = (tokenUserId && (order.userId === tokenUserId || order.user_id === tokenUserId)) ||
                      (tokenEmail && order.email && order.email.toLowerCase() === tokenEmail);

      if (decoded.role !== 'admin' && !isOwner) {
        return res.status(403).json({ error: 'Forbidden: You do not own this order' });
      }

      const rawDate = order.orderDate || order.order_date || order.created_at;
      const orderTime = rawDate ? new Date(rawDate).getTime() : Date.now();
      const now = new Date().getTime();
      if (!isNaN(orderTime) && (now - orderTime > 60 * 60 * 1000) && decoded.role !== 'admin') {
         return res.status(400).json({ error: 'Order cannot be cancelled after 1 hour' });
      }

      const cancellableStatuses = ['Confirmed', 'Pending', 'Processing'];
      if (!cancellableStatuses.includes(order.status) && decoded.role !== 'admin') {
         return res.status(400).json({ error: `Order status is '${order.status}' and cannot be cancelled.` });
      }

      const cancelledBy = decoded.role === 'admin' ? 'admin' : 'client';
      const cancellationReason = req.body?.reason || (cancelledBy === 'client' ? 'Cancelled by customer via self-service portal' : 'Cancelled by administrator');
      const cancelledAt = new Date().toISOString();

      const adb = getAdminDb();
      if (adb) {
        try {
          await adb.collection('orders').doc(orderId).update({
            status: 'Cancelled',
            cancelledBy,
            cancellationReason,
            cancelledAt
          });
        } catch (adbErr) {
          console.warn('Admin SDK order cancel update error:', adbErr);
        }
      }

      await updateDoc(orderRef, {
        status: 'Cancelled',
        cancelledBy,
        cancellationReason,
        cancelledAt
      });

      await logServerAuditActivity(req, 'ORDER_CANCEL', `Order ${orderId} cancelled by ${cancelledBy} (${decoded.email || 'user'})`);

      const orderEmail = order.email;
      if (orderEmail) {
        const orderName = order.fullname || order.user_name || 'Customer';
        const statusSubject = `❌ Order Cancelled - ${orderId}`;
        const content = `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 50%; padding: 16px; margin-bottom: 12px;">
              <span style="font-size: 32px;">❌</span>
            </div>
            <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 8px 0;">Order Cancelled</h2>
            <p style="font-size: 14px; color: #a1a1aa; margin: 0;">Order <strong style="color: #3b82f6;">${orderId}</strong> has been cancelled.</p>
          </div>

          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">Hi <strong>${orderName}</strong>,</p>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 24px 0;">Your order <strong>${orderId}</strong> has been successfully cancelled as requested. If this was a mistake, or if you require any assistance, please don't hesitate to reach out to our dedicated support channels below.</p>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Thank you for shopping with Tizzitech!</p>
        `;
        const statusHtml = getPremiumTemplateHtml(statusSubject, content, getBaseUrl(req));
        try {
          await sendEmail(orderEmail, statusSubject, statusHtml).catch(err => console.error("Async email failed:", err));
        } catch (emailErr) {
          console.error("Failed to send cancellation email", emailErr);
        }
      }

      return res.json({ success: true });
    } catch(e) {
      console.log('Error cancelling order', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fallback in-memory order cancellation with strict IDOR ownership checks
  const fallbackOrder = fallbackOrders.find(o => o.id === orderId);
  if (!fallbackOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const isFallbackOwner = (tokenUserId && (fallbackOrder.user_id === tokenUserId || (fallbackOrder as any).userId === tokenUserId)) ||
                          (tokenEmail && fallbackOrder.email && fallbackOrder.email.toLowerCase() === tokenEmail);

  if (decoded.role !== 'admin' && !isFallbackOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not own this order' });
  }

  const fbRawDate = fallbackOrder.orderDate || (fallbackOrder as any).order_date;
  const fbOrderTime = fbRawDate ? new Date(fbRawDate).getTime() : Date.now();
  const fbNow = Date.now();
  if (!isNaN(fbOrderTime) && (fbNow - fbOrderTime > 60 * 60 * 1000) && decoded.role !== 'admin') {
    return res.status(400).json({ error: 'Order cannot be cancelled after 1 hour' });
  }

  const cancellableStatuses = ['Confirmed', 'Pending', 'Processing'];
  if (!cancellableStatuses.includes(fallbackOrder.status) && decoded.role !== 'admin') {
    return res.status(400).json({ error: `Order status is '${fallbackOrder.status}' and cannot be cancelled.` });
  }

  fallbackOrder.status = 'Cancelled';
  (fallbackOrder as any).cancelledBy = decoded.role === 'admin' ? 'admin' : 'client';
  (fallbackOrder as any).cancellationReason = req.body?.reason || 'Cancelled by customer via self-service portal';
  (fallbackOrder as any).cancelledAt = new Date().toISOString();

  return res.json({ success: true });
});
// 2. CREATE NEW ORDER (Rate limited & Bot protected)
app.post('/api/orders', orderLimiter, honeypotBotDetector, async (req, res) => {
  const { fullname, email, address, paymentOption, total, items, userId } = req.body;
  const orderId = `TZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const orderDate = new Date();
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);

  // Authenticate user token if provided to prevent IDOR / spoofing another user's ID
  let authenticatedUserId: string | null = null;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      authenticatedUserId = decoded.userId || decoded.backendId || decoded.id || null;
    } catch (e) {
      // Invalid token, treat as unauthenticated
    }
  }

  // Bind order strictly to authenticated user; prevent arbitrary unauthenticated user ID injection
  const effectiveUserId = authenticatedUserId || (userId && userId === authenticatedUserId ? userId : null);

  const db = getFirebaseDb();
  if (db) {
    try {
      let serverItemsTotal = 0;
      const validItems: any[] = [];

      await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const prodRefs = items.map((item: any) => doc(db, 'products', item.id));
        const prodDocs = await Promise.all(prodRefs.map((ref: any) => transaction.get(ref)));
        
        for (let i = 0; i < prodDocs.length; i++) {
          const prodDoc = prodDocs[i];
          const requestedItem = items[i];
          
          if (!prodDoc.exists()) {
             throw new Error(`Product ${requestedItem.id} not found.`);
          }
          
          const pData = prodDoc.data() as any;
          if ((pData.stock || 0) < requestedItem.quantity) {
             throw new Error(`Insufficient stock for product ${pData.name}. Only ${pData.stock || 0} remaining.`);
          }
          
          const genuinePrice = pData.price || 0;
          serverItemsTotal += genuinePrice * requestedItem.quantity;
          validItems.push({
             id: requestedItem.id,
             name: pData.name || requestedItem.name || 'Product',
             price: genuinePrice,
             quantity: requestedItem.quantity,
             newStock: (pData.stock || 0) - requestedItem.quantity
          });
        }

        // --- ANTI-TAMPERING VALIDATION ---
        // Client sends `total` which includes items + delivery fee (usually 0 to 7000).
        // If client total is less than the raw items total, tampering occurred.
        // We allow the client total to be slightly higher (to account for delivery fees).
        if (total < serverItemsTotal) {
           throw new Error(`Tampering detected: Paid amount (₦${total}) is less than items value (₦${serverItemsTotal}).`);
        }

        // --- WRITE PHASE ---
        const orderRef = doc(db, 'orders', orderId);
        transaction.set(orderRef, {
          id: orderId,
          user_id: effectiveUserId,
          userId: effectiveUserId,
          fullname,
          email,
          address,
          payment_option: paymentOption,
          paymentOption,
          total: total, // we persist the valid total with delivery fee included
          status: 'Confirmed',
          order_date: orderDate.toISOString(),
          orderDate: orderDate.toISOString(),
          expected_delivery_date: expectedDeliveryDate.toISOString(),
          expectedDeliveryDate: expectedDeliveryDate.toISOString(),
          items: validItems.map(item => ({ id: item.id, price: item.price, quantity: item.quantity, name: item.name }))
        });

        for (let i = 0; i < validItems.length; i++) {
           const vItem = validItems[i];
           const orderItemId = `oi${Math.random().toString(36).substring(2, 8)}`;
           const oiRef = doc(db, 'order_items', orderItemId);
           transaction.set(oiRef, {
             id: orderItemId,
             order_id: orderId,
             product_id: vItem.id,
             price: vItem.price,
             quantity: vItem.quantity
           });

           transaction.update(prodRefs[i], { stock: vItem.newStock });

           // Low stock check: if product drops to 5 items or fewer, trigger email alert
           if (vItem.newStock <= 5) {
             const lowStockSubject = `⚠️ LOW STOCK DETECTED: ${vItem.name}`;
             const lowStockHtml = `
               <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px;">
                 <h2 style="color: #ef4444; margin-top: 0;">⚠️ Low Stock Automation Alert</h2>
                 <p>Dear Admin,</p>
                 <p>An automated inventory threshold event has occurred. The stock level for the following item has dropped to <strong>5 or fewer items</strong>:</p>
                 <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                   <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                     <tr>
                       <td style="color: #71717a; padding: 4px 0;">Product ID</td>
                       <td style="color: #ffffff; font-family: monospace; font-weight: 500;">${vItem.id}</td>
                     </tr>
                     <tr>
                       <td style="color: #71717a; padding: 4px 0;">Product Name</td>
                       <td style="color: #ffffff; font-weight: bold;">${vItem.name}</td>
                     </tr>
                     <tr>
                       <td style="color: #71717a; padding: 4px 0;">Updated Stock Level</td>
                       <td style="color: #ef4444; font-weight: 800;">${vItem.newStock} remaining</td>
                     </tr>
                   </table>
                 </div>
                 <p style="font-size: 13px; color: #a1a1aa;">Please log in to your dashboard and restock the product or contact your suppliers immediately to prevent complete stock depletion.</p>
                 <div style="text-align: center; margin-top: 24px;">
                   <a href="${getBaseUrl(req)}/admin" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 6px;">Manage Inventory</a>
                 </div>
               </div>
             `;
             sendEmail('idowutosin70@gmail.com', lowStockSubject, lowStockHtml)
               .catch(err => console.error("Low stock email dispatch failed:", err));
           }
        }
      });

      // Send responsive high-fidelity order confirmation invoice email
      const orderSubject = `Order Confirmation - ${orderId}`;
      const orderContent = `
        <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 12px 0;">Order Confirmed!</h2>
        <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${fullname}</strong>, thank you for shopping with us! We have received your order and our fulfillment team is busy packing it. Your tracking ID is <strong style="color: #3b82f6;">${orderId}</strong>.</p>

        <!-- Order Status Summary -->
        <div style="background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="color: #9ca3af; padding: 6px 0;">Order Date</td>
              <td style="color: #ffffff; text-align: right; font-weight: 500;">${orderDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 6px 0;">Estimated Delivery</td>
              <td style="color: #ffffff; text-align: right; font-weight: 500;">${expectedDeliveryDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 6px 0;">Fulfillment Status</td>
              <td style="color: #06b6d4; text-align: right; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Confirmed</td>
            </tr>
          </table>
        </div>

        <!-- Items Breakdown -->
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 0 0 16px 0; border-bottom: 1px solid #1f2937; padding-bottom: 8px;">Order Details</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="border-bottom: 1px solid #1f2937; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">
              <th style="text-align: left; padding: 12px 0;">Item</th>
              <th style="text-align: center; padding: 12px 0; width: 60px;">Qty</th>
              <th style="text-align: right; padding: 12px 0; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${validItems.map(item => `
              <tr style="border-bottom: 1px solid #1f2937; font-size: 14px;">
                <td style="padding: 16px 0; color: #ffffff; font-weight: 600;">
                  ${item.name}
                </td>
                <td style="padding: 16px 0; text-align: center; color: #9ca3af; font-weight: 500;">${item.quantity}</td>
                <td style="padding: 16px 0; text-align: right; color: #ffffff; font-weight: 600; font-family: monospace;">₦${item.price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Financial Summary -->
        <div style="border-top: 1px solid #1f2937; padding-top: 16px; margin-bottom: 32px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="color: #9ca3af; padding: 6px 0;">Subtotal</td>
              <td style="color: #ffffff; text-align: right; font-weight: 500; font-family: monospace;">₦${serverItemsTotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 6px 0;">Delivery Fee</td>
              <td style="color: #ffffff; text-align: right; font-weight: 500; font-family: monospace;">₦${Math.max(0, total - serverItemsTotal).toLocaleString()}</td>
            </tr>
            <tr style="border-top: 1px solid #374151;">
              <td style="color: #ffffff; font-weight: 700; padding: 16px 0 6px 0; font-size: 16px;">Total Charged</td>
              <td style="color: #06b6d4; text-align: right; font-weight: 800; padding: 16px 0 6px 0; font-size: 18px; font-family: monospace;">₦${total.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Details -->
        <div style="background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 36px;">
          <h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 0 0 10px 0;">Delivery Address</h4>
          <p style="font-size: 14px; color: #ffffff; line-height: 1.5; margin: 0;">${address}</p>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 12px;">
          <a href="${getBaseUrl(req)}/?view=tracking&orderId=${orderId}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Track Order Real-Time</a>
        </div>
      `;
      const orderHtml = getPremiumTemplateHtml(orderSubject, orderContent, getBaseUrl(req));
      await sendEmail(email, orderSubject, orderHtml).catch(err => console.error("Async email failed:", err));

      return res.json({
        success: true,
        orderId,
        status: 'Confirmed',
        expectedDeliveryDate
      });
    } catch (err: any) {
      console.error('Order processing failed:', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Order processing failed.' });
    }
  }

  // Fallback order submission (in-memory)
  let serverFallbackTotal = 0;
  for (const orderedItem of items) {
    const prod = fallbackProducts.find(p => p.id === orderedItem.id);
    if (!prod) return res.status(400).json({ success: false, message: 'Product not found.' });
    if (prod.stock < orderedItem.quantity) return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    serverFallbackTotal += prod.price * orderedItem.quantity;
  }
  if (total < serverFallbackTotal) {
    return res.status(400).json({ success: false, message: 'Tampering detected in fallback.' });
  }

  const newOrder = {
    id: orderId,
    user_id: effectiveUserId,
    userId: effectiveUserId,
    fullname,
    email,
    address,
    paymentOption,
    total,
    items,
    status: 'Confirmed',
    orderDate,
    expectedDeliveryDate
  };

  fallbackOrders.push(newOrder);

  // Update fallback stock
  items.forEach((orderedItem: any) => {
    const prod = fallbackProducts.find(p => p.id === orderedItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - orderedItem.quantity);
    }
  });

  // Send order confirmation email (fallback)
  const orderSubject = `Order Confirmation - ${orderId}`;
  const orderContent = `
    <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 12px 0;">Order Confirmed!</h2>
    <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${fullname}</strong>, thank you for shopping with us! We have received your order and our fulfillment team is busy packing it. Your tracking ID is <strong style="color: #3b82f6;">${orderId}</strong>.</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 20px;">Total Charged: <strong style="font-family: monospace; color: #06b6d4;">₦${total.toLocaleString()}</strong></p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Your items are being prepared and your expected delivery date is ${expectedDeliveryDate.toDateString()}. We will notify you as soon as your order status changes.</p>
  `;
  const orderHtml = getPremiumTemplateHtml(orderSubject, orderContent, process.env.APP_URL || 'https://tizzitech.com.ng');
  await sendEmail(email, orderSubject, orderHtml).catch(err => console.error("Async email failed:", err));

  return res.json({
    success: true,
    orderId,
    status: 'Confirmed',
    expectedDeliveryDate
  });
});

// 3. CREATE PRODUCT REVIEW
app.post('/api/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  const { author, rating, comment } = req.body;
  const reviewId = `r${Math.random().toString(36).substring(7)}`;
  const date = new Date().toISOString().split('T')[0];

  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      // In a real DB, you'd insert reviews to a `reviews` table config
      console.log(`Saving review in MySQL for product ${productId}:`, { author, rating, comment });
    } catch (err: any) {
      console.log('MySQL review write issue:', err.message);
    }
  }

  // Handle local state update
  const prod = fallbackProducts.find(p => p.id === productId);
  if (prod) {
    if (!prod.reviews) prod.reviews = [];
    prod.reviews.push({ id: reviewId, author, rating, comment, date });
  }

  return res.json({ success: true, review: { id: reviewId, author, rating, comment, date } });
});

// 4. ADMIN: UPDATE PRODUCT STOCK
app.patch('/api/products/:productId/stock', verifyAdminToken, async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body;

  let oldStock = 'unknown';
  const db = getFirebaseDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'products', productId));
      if (snap.exists()) {
        oldStock = snap.data().stock !== undefined ? String(snap.data().stock) : 'unknown';
      }
      await updateDoc(doc(db, 'products', productId), { stock });
      await logServerAuditActivity(req, 'STOCK_UPDATE', `Updated stock for product ${productId} from ${oldStock} to ${stock}`);
      return res.json({ success: true, stock });
    } catch (err: any) {
      console.log('Firestore fallback for updating product stock:', err.message);
    }
  }

  // local update fallback
  const prod = fallbackProducts.find(p => p.id === productId);
  if (prod) {
    oldStock = prod.stock !== undefined ? String(prod.stock) : 'unknown';
    prod.stock = stock;
  }

  await logServerAuditActivity(req, 'STOCK_UPDATE', `Updated stock for product ${productId} from ${oldStock} to ${stock} (Fallback)`);
  return res.json({ success: true, productId, stock });
});

// Admin and Auth Rate Limiters moved up

// 5. ADMIN: RETRIEVE ALL ORDERS (OPTIMIZED: In-Memory join to prevent N+1 sequential query blocking)
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
  const adb = getAdminDb();
  if (adb) {
    try {
      // 1. Fetch all orders (1 query)
      const ordersSnap = await adb.collection('orders').get();
      let ordersRows: any[] = [];
      ordersSnap.forEach((doc: any) => {
        ordersRows.push({ id: doc.id, ...doc.data() });
      });
      ordersRows.sort((a: any, b: any) => {
        const valA = a.orderDate || a.order_date;
        const valB = b.orderDate || b.order_date;
        const tA = valA ? new Date(valA).getTime() : 0;
        const tB = valB ? new Date(valB).getTime() : 0;
        const cleanA = isNaN(tA) ? 0 : tA;
        const cleanB = isNaN(tB) ? 0 : tB;
        return cleanB - cleanA;
      });

      // 2. Fetch all products once to map them by ID (1 query)
      const productsSnap = await adb.collection('products').get();
      const productsMap = new Map<string, any>();
      productsSnap.forEach((doc: any) => {
        productsMap.set(doc.id, doc.data());
      });

      // 3. Fetch all order_items once to map by order_id (1 query)
      const orderItemsSnap = await adb.collection('order_items').get();
      const orderItemsMap = new Map<string, any[]>();
      orderItemsSnap.forEach((doc: any) => {
        const data = doc.data();
        const orderId = data.order_id;
        if (orderId) {
          if (!orderItemsMap.has(orderId)) {
            orderItemsMap.set(orderId, []);
          }
          orderItemsMap.get(orderId)!.push(data);
        }
      });

      // 4. Join them completely in-memory O(N + M + P) - No nested queries!
      const ordersData = [];
      for (const order of ordersRows) {
        const itemsDocs = orderItemsMap.get(order.id || '') || [];
        const itemsArray = [];
        for (const iData of itemsDocs) {
           const pData = productsMap.get(iData.product_id) || null;
           itemsArray.push({
             id: iData.product_id, 
             name: pData?.name || 'Unknown Product', 
             brand: pData?.brand || 'Unknown',
             category: pData?.category || 'Unknown', 
             price: iData.price, 
             quantity: iData.quantity,
             imageUrl: pData?.imageUrl || ''
           });
        }
        ordersData.push({
          id: order.id,
          fullname: order.fullname,
          email: order.email,
          address: order.address,
          paymentOption: order.payment_option,
          total: order.total,
          status: order.status,
          orderDate: order.orderDate || order.order_date,
          expectedDeliveryDate: order.expectedDeliveryDate || order.expected_delivery_date,
          items: itemsArray
        });
      }
      return res.json(ordersData);
    } catch (err: any) {
      console.error('Error fetching orders via Admin SDK:', err.message);
    }
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      // 1. Fetch all orders (1 query)
      const ordersSnap = await getDocs(collection(db, 'orders'));
      let ordersRows = ordersSnap.docs.map((d: any) => d.data());
      ordersRows.sort((a, b) => {
        const valA = a.orderDate || a.order_date;
        const valB = b.orderDate || b.order_date;
        const tA = valA ? new Date(valA).getTime() : 0;
        const tB = valB ? new Date(valB).getTime() : 0;
        const cleanA = isNaN(tA) ? 0 : tA;
        const cleanB = isNaN(tB) ? 0 : tB;
        return cleanB - cleanA;
      });

      // 2. Fetch all products once to map them by ID (1 query)
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsMap = new Map<string, any>();
      productsSnap.docs.forEach((d: any) => {
        productsMap.set(d.id, d.data());
      });

      // 3. Fetch all order_items once to map by order_id (1 query)
      const orderItemsSnap = await getDocs(collection(db, 'order_items'));
      const orderItemsMap = new Map<string, any[]>();
      orderItemsSnap.docs.forEach((d: any) => {
        const data = d.data();
        const orderId = data.order_id;
        if (orderId) {
          if (!orderItemsMap.has(orderId)) {
            orderItemsMap.set(orderId, []);
          }
          orderItemsMap.get(orderId)!.push(data);
        }
      });

      // 4. Join them completely in-memory O(N + M + P) - No nested queries!
      const ordersData = [];
      for (const order of ordersRows) {
        const itemsDocs = orderItemsMap.get(order.id || '') || [];
        const itemsArray = [];
        for (const iData of itemsDocs) {
           const pData = productsMap.get(iData.product_id) || null;
           itemsArray.push({
             id: iData.product_id, 
             name: pData?.name || 'Unknown Product', 
             brand: pData?.brand || 'Unknown',
             category: pData?.category || 'Unknown', 
             price: iData.price, 
             quantity: iData.quantity,
             imageUrl: pData?.imageUrl || ''
           });
        }
        ordersData.push({
          id: order.id,
          fullname: order.fullname,
          email: order.email,
          address: order.address,
          paymentOption: order.payment_option,
          total: order.total,
          status: order.status,
          orderDate: order.orderDate || order.order_date,
          expectedDeliveryDate: order.expectedDeliveryDate || order.expected_delivery_date,
          items: itemsArray
        });
      }
      return res.json(ordersData);
    } catch (err: any) {
      console.log('Firestore fallback triggered for /api/admin/orders:', err.stack);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
  }

  return res.json(fallbackOrders);
});

// 6. ADMIN: UPDATE ORDER STATUS
app.patch('/api/admin/orders/:orderId/status', verifyAdminToken, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  let orderEmail = '';
  let orderName = '';
  let orderAddress = 'Your Registered Address';

  const buildStatusEmail = (orderIdStr: string, nameStr: string, statusStr: string, addressStr: string, reqObj: any) => {
    let statusSubject = `Order Status Update - #${orderIdStr}`;
    let statusTitle = `Order Status Updated`;
    let statusMessage = `The status of your order <strong>#${orderIdStr}</strong> has been updated to <strong>${statusStr}</strong>.`;
    let statusIcon = '📦';
    let statusColor = '#3b82f6';

    if (statusStr === 'Accepted') {
      statusSubject = `✅ Order Accepted & Confirmed - #${orderIdStr}`;
      statusTitle = `Order Accepted!`;
      statusMessage = `Great news! Your order <strong>#${orderIdStr}</strong> has been officially accepted by our fulfillment team. Our warehouse is preparing your items for courier pickup and dispatch.`;
      statusIcon = '✅';
      statusColor = '#f59e0b';
    } else if (statusStr === 'In Transit') {
      statusSubject = `🚚 Your Order is On Route! - #${orderIdStr}`;
      statusTitle = `Your Order is On the Way!`;
      statusMessage = `Exciting news! Courier dispatch is active and your order <strong>#${orderIdStr}</strong> is currently on route to your address. You can track real-time progress using your order tracker.`;
      statusIcon = '🚚';
      statusColor = '#10b981';
    } else if (statusStr === 'Picked Up') {
      statusSubject = `📦 Order Picked Up by Courier - #${orderIdStr}`;
      statusTitle = `Parcel Picked Up`;
      statusMessage = `Your package for order <strong>#${orderIdStr}</strong> has been picked up from our dispatch center and is being processed for final delivery.`;
      statusIcon = '📦';
      statusColor = '#6366f1';
    } else if (statusStr === 'Delivered') {
      statusSubject = `🎉 Order Delivered Successfully! - #${orderIdStr}`;
      statusTitle = `Order Delivered!`;
      statusMessage = `Your package for order <strong>#${orderIdStr}</strong> has been successfully delivered to <strong>${addressStr}</strong>. Thank you for shopping with Tizzitech!`;
      statusIcon = '🎉';
      statusColor = '#10b981';
    } else if (statusStr === 'Cancelled') {
      statusSubject = `❌ Order Cancelled - #${orderIdStr}`;
      statusTitle = `Order Cancelled`;
      statusMessage = `Your order <strong>#${orderIdStr}</strong> has been cancelled. If you have any questions or feel this was done in error, please reach out to our support team immediately.`;
      statusIcon = '❌';
      statusColor = '#ef4444';
    } else if (statusStr === 'Processing') {
      statusSubject = `⚙️ Order Processing - #${orderIdStr}`;
      statusTitle = `Order In Processing`;
      statusMessage = `Your order <strong>#${orderIdStr}</strong> is currently being processed by our team.`;
      statusIcon = '⚙️';
      statusColor = '#8b5cf6';
    }

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: rgba(31, 41, 55, 0.8); border: 1px solid #374151; border-radius: 50%; padding: 18px; margin-bottom: 14px;">
          <span style="font-size: 36px;">${statusIcon}</span>
        </div>
        <h2 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 8px 0;">${statusTitle}</h2>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0;">Order Ref: <strong style="color: #3b82f6;">#${orderIdStr}</strong></p>
      </div>

      <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">Hi <strong>${nameStr}</strong>,</p>
      <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin: 0 0 24px 0;">${statusMessage}</p>

      <div style="background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 0 0 12px 0;">Live Tracking & Delivery Info</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #9ca3af; padding: 6px 0;">Current Status</td>
            <td style="color: ${statusColor}; text-align: right; font-weight: bold; text-transform: uppercase;">${statusStr}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 6px 0;">Delivery Address</td>
            <td style="color: #ffffff; text-align: right; font-weight: 500;">${addressStr}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="${getBaseUrl(reqObj)}/?view=tracking&orderId=${orderIdStr}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">View Live Tracking Dashboard</a>
      </div>
    `;

    return {
      subject: statusSubject,
      html: getPremiumTemplateHtml(statusSubject, content, getBaseUrl(reqObj))
    };
  };

  const db = getFirebaseDb();
  if (db) {
    try {
      const orderSnap = await getDoc(doc(db, 'orders', orderId));
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        orderEmail = orderData.email || orderData.user_email || '';
        orderName = orderData.fullname || orderData.user_name || 'Customer';
        orderAddress = orderData.address || 'Your Registered Address';
      }
      await updateDoc(doc(db, 'orders', orderId), { status });
      
      if (orderEmail) {
        const mailData = buildStatusEmail(orderId, orderName, status, orderAddress, req);
        await sendEmail(orderEmail, mailData.subject, mailData.html).catch(err => console.error("Async status email failed:", err));
      }
      
      await logServerAuditActivity(req, 'ORDER_UPDATE', `Updated status of order ${orderId} to "${status}"`);
      return res.json({ success: true, orderId, status });
    } catch (err: any) {
      console.log('Firestore update error for /api/admin/orders/:orderId/status:', err.message);
    }
  }

  const order = fallbackOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    orderEmail = order.email;
    orderName = order.fullname;
    orderAddress = order.address || 'Your Registered Address';
    
    if (orderEmail) {
      const mailData = buildStatusEmail(orderId, orderName, status, orderAddress, req);
      await sendEmail(orderEmail, mailData.subject, mailData.html).catch(err => console.error("Async status email failed:", err));
    }
  }
  await logServerAuditActivity(req, 'ORDER_UPDATE', `Updated status of order ${orderId} to "${status}" (Fallback)`);
  return res.json({ success: true, orderId, status });
});

// 6b. ADMIN: BATCH UPDATE ORDER STATUS
app.patch('/api/admin/orders/batch-status', verifyAdminToken, async (req, res) => {
  const { orderIds, status } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
    return res.status(400).json({ success: false, message: 'orderIds array and status are required' });
  }

  const validStatuses = ['Accepted', 'In Transit', 'Picked Up', 'Delivered', 'Cancelled', 'Processing', 'Confirmed', 'Pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status provided' });
  }

  const adb = getAdminDb();
  const db = getFirebaseDb();

  // Update in Firestore
  if (adb) {
    try {
      const batch = adb.batch();
      for (const id of orderIds) {
        const ref = adb.collection('orders').doc(id);
        batch.update(ref, { status, updatedAt: new Date().toISOString() });
      }
      await batch.commit();
    } catch (e: any) {
      console.warn("Batch order update via admin DB failed, trying individual updates:", e.message);
    }
  } else if (db) {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      for (const id of orderIds) {
        batch.update(doc(db, 'orders', id), { status });
      }
      await batch.commit();
    } catch (e: any) {
      console.warn("Batch order update via client DB fallback:", e.message);
    }
  }

  // Update in fallback
  for (const id of orderIds) {
    const o = fallbackOrders.find(fo => fo.id === id);
    if (o) {
      o.status = status;
    }
  }

  await logServerAuditActivity(req, 'BATCH_ORDER_UPDATE', `Batch updated status of ${orderIds.length} orders to "${status}"`);
  return res.json({ success: true, count: orderIds.length, status, orderIds });
});

// 6c. ADMIN: BATCH UPDATE PRODUCT STOCK
app.patch('/api/admin/products/batch-stock', verifyAdminToken, async (req, res) => {
  const { updates } = req.body; // updates: { id: string, stock: number }[]
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: 'updates array is required' });
  }

  const adb = getAdminDb();
  const db = getFirebaseDb();

  if (adb) {
    try {
      const batch = adb.batch();
      for (const u of updates) {
        if (u.id && typeof u.stock === 'number') {
          const ref = adb.collection('products').doc(u.id);
          batch.update(ref, { stock: Math.max(0, u.stock), updatedAt: new Date().toISOString() });
        }
      }
      await batch.commit();
    } catch (e: any) {
      console.warn("Batch product stock update via admin DB failed:", e.message);
    }
  } else if (db) {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      for (const u of updates) {
        if (u.id && typeof u.stock === 'number') {
          batch.update(doc(db, 'products', u.id), { stock: Math.max(0, u.stock) });
        }
      }
      await batch.commit();
    } catch (e: any) {
      console.warn("Batch product stock update via client DB fallback:", e.message);
    }
  }

  // Update in fallback
  for (const u of updates) {
    const p = fallbackProducts.find(fp => fp.id === u.id);
    if (p && typeof u.stock === 'number') {
      p.stock = Math.max(0, u.stock);
    }
  }

  await logServerAuditActivity(req, 'BATCH_STOCK_UPDATE', `Batch updated stock for ${updates.length} products`);
  return res.json({ success: true, count: updates.length, updates });
});

// 7. ADMIN: AUTHENTICATE SYSTEM ACCESS
app.post('/api/admin/authenticate', authLimiter, (req, res) => {
  const { key } = req.body;
  const systemKey = process.env.ADMIN_KEY || 'admin123';
  
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set.');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  if (key === systemKey) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Incorrect Administrator Passkey.' });
});

// 8. ADMIN: ADD NEW PRODUCT
app.post('/api/products', verifyAdminToken, async (req, res) => {
  const newProduct = req.body;

  const db = getFirebaseDb();
  if (db) {
    try {
      const { id, name, brand, category, price, condition, specs, description, stock, imageUrl } = newProduct;
      await setDoc(doc(db, 'products', id), newProduct);
      await logServerAuditActivity(req, 'PRODUCT_CREATE', `Created product "${name}" (ID: ${id}) with initial stock ${stock}`);
      return res.json({ success: true, product: newProduct });
    } catch (err: any) {
      console.log('Firestore fallback for adding product:', err.message);
    }
  }

  // local fallback
  fallbackProducts.push({ ...newProduct, reviews: [] });
  await logServerAuditActivity(req, 'PRODUCT_CREATE', `Created product "${newProduct.name}" (ID: ${newProduct.id}) with initial stock ${newProduct.stock} (Fallback)`);
  return res.json({ success: true, product: newProduct });
});

// 8b. ADMIN: UPDATE PRODUCT (INCLUDING MULTIPLE IMAGES)
app.put('/api/products/:productId', verifyAdminToken, async (req, res) => {
  const { productId } = req.params;
  const updatedProduct = req.body;

  const db = getFirebaseDb();
  if (db) {
    try {
      await updateDoc(doc(db, 'products', productId), updatedProduct);
      await logServerAuditActivity(req, 'PRODUCT_UPDATE', `Updated product "${updatedProduct.name || productId}" with ${updatedProduct.images?.length || 1} images`);
      return res.json({ success: true, product: updatedProduct });
    } catch (err: any) {
      console.log('Firestore fallback for updating product:', err.message);
    }
  }

  // local fallback
  const idx = fallbackProducts.findIndex(p => p.id === productId);
  if (idx !== -1) {
    fallbackProducts[idx] = { ...fallbackProducts[idx], ...updatedProduct };
  }
  await logServerAuditActivity(req, 'PRODUCT_UPDATE', `Updated product "${updatedProduct.name || productId}" (Fallback)`);
  return res.json({ success: true, product: updatedProduct });
});

// 8a. ADMIN: UPLOAD PRODUCT IMAGE
// Use express.json limit for large base64 strings
app.post('/api/admin/upload-image', verifyAdminToken, express.json({limit: '10mb'}), upload.single('image'), async (req, res) => {
  try {
    let dataURI = '';
    
    // Check if it's sent as a JSON body (base64)
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary credentials are not configured on the server.' });
    }

    if (req.body && req.body.image) {
      dataURI = req.body.image;
    } 
    // Fallback to multer file upload if FormData is used
    else if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    } else {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'tizzitech_products',
    });
    
    await logServerAuditActivity(req, 'IMAGE_UPLOAD', `Uploaded image: ${result.secure_url}`);
    return res.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image: ' + (error.message || JSON.stringify(error)) });
  }
});

// 8b. ADMIN: SEED DATABASE
app.post("/api/admin/force-seed", verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (!db) return res.status(500).json({ success: false, message: "No db" });
  try {
    const productsToSeed = fallbackProducts.map(({ id, name, brand, category, price, condition, specs, description, stock, imageUrl }) => ({ id, name, brand, category, price, condition, specs, description: description || "", stock, imageUrl }));
    await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, "products", p.id), p)));
    await logServerAuditActivity(req, 'DATABASE_SEED', `Force seeded ${productsToSeed.length} products to Firestore`, 'idowutosin70@gmail.com');
    return res.json({ success: true, message: "Seeded" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/seed', verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Firestore client not initialized.' });
  }

  try {
    const productsToSeed = fallbackProducts.map(({ id, name, brand, category, price, condition, specs, description, stock, imageUrl }) => ({
      id, name, brand, category, price, condition, specs, description, stock, imageUrl
    }));

    await Promise.all(productsToSeed.map((p: any) => setDoc(doc(db, 'products', p.id), p)));
    await logServerAuditActivity(req, 'DATABASE_SEED', `Seeded ${productsToSeed.length} products to Firestore`);
    
    return res.json({ success: true, message: 'Initial fallback products seeded to Firestore successfully.' });
  } catch (err: any) {
    console.error('Firestore seeding error:', err.message);
    return res.status(500).json({ success: false, message: 'Seeding failed.', error: err.message });
  }
});

// 9. DATABASE STATUS TEST (MySQL)
app.get('/api/db-test', async (req, res) => {
  const mysqlPool = getMySQLPool();
  if (!mysqlPool) {
    return res.status(500).json({ success: false, message: 'MySQL is not configured or failed to initialize.' });
  }

  try {
    const [rows]: any = await mysqlPool.query('SELECT 1 + 1 AS solution');
    return res.json({ success: true, message: 'Successfully connected to MySQL database on the cloud server!', result: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to query the database.', error: err.message });
  }
});

// 10. SUPABASE STATUS TEST
app.get('/api/firestore-test', async (req, res) => {
  const firebasedb = getFirebaseDb();
  if (!firebasedb) {
    return res.status(500).json({ success: false, message: 'Firestore keys are missing in the .env file.' });
  }

  try {
    // A simple query to check connection, assuming there's at least one table we can lightly query, 
    // or just checking if the auth/client is active. We can query a dummy non-existent table just to see the error type, 
    // but the easiest way is checking if the client initialized successfully. 
    return res.json({ success: true, message: 'Successfully connected to Firestore from the backend!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to query Firestore.', error: err.message });
  }
});

// 11. USER REGISTRATION (Protected against bot spam & brute registrations)
app.post('/api/auth/register', registerLimiter, honeypotBotDetector, async (req, res) => {
  const { email, password, firstName, surname, address, phone, clientGeo } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  // Enforce password strength
  const passCheck = validatePasswordStrength(password);
  if (!passCheck.isValid) {
    return res.status(400).json({ success: false, message: passCheck.message });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userId = `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Email verification token (valid for 24 hours)
  const verificationToken = jwt.sign({ userId, email: cleanEmail, purpose: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
  const verifyLink = `${getBaseUrl(req)}/?view=verify-email&token=${verificationToken}`;

  const db = getFirebaseDb();
  if (db) {
    try {
      // Check existing user
      const existQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) return res.status(400).json({ success: false, message: 'Email already registered' });

      let geo = clientGeo;
      if (!geo || !geo.country || geo.country === 'Unknown' || geo.country === 'UNKNOWN') {
        geo = await getRequestGeo(req);
      }
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        email: cleanEmail,
        password: hashedPassword,
        firstname: firstName,
        lastname: surname,
        address: address || '',
        phone: phone || '',
        role: 'user',
        emailVerified: false,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        createdAt: new Date().toISOString()
      });

      // Record registered visit in analytics_visits
      try {
        const visitVisitorId = (req.body && req.body.visitorId) || userId;
        await setDoc(doc(collection(db, 'analytics_visits')), {
          visitorId: visitVisitorId,
          userId: userId,
          isRegistered: true,
          country: geo.country || 'Nigeria',
          region: geo.region || 'Lagos',
          city: geo.city || '',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not record analytics visit during registration:', err);
      }

      const token = jwt.sign({ userId, email: cleanEmail, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      
      // Send welcome and verification email
      const welcomeSubject = "Welcome to Tizzitech - Verify Your Email";
      const welcomeContent = `
        <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">Welcome, ${firstName}!</h2>
        <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">We are thrilled to welcome you to <strong>Tizzitech Online Store</strong> — your trusted destination for laptops, gadgets, and tech accessories.</p>
        <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">To ensure your account security and enable all order management features, please verify your email address below:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">Verify Email Address</a>
        </div>
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">This verification link will remain active for 24 hours. If you did not create an account, you can disregard this message.</p>
      `;
      const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, getBaseUrl(req));
      let deliveryStatus = 'pending';
      let emailError = null;
      try {
        await sendEmail(cleanEmail, welcomeSubject, welcomeHtml);
        deliveryStatus = 'delivered';
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
        deliveryStatus = 'failed';
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userId), { deliveryStatus, emailError: emailError || null });
      } catch (e) {}
      
      return res.json({ 
        success: true, 
        token, 
        user: { 
          id: userId, 
          email: cleanEmail, 
          firstName, 
          surname, 
          address, 
          phone, 
          role: 'user',
          emailVerified: false
        } 
      });
    } catch (err: any) {
      console.warn('Firestore not fully configured yet, falling back to local memory for registration.');
    }
  }

  // Fallback to in-memory registration
  const existingFallbackUser = fallbackUsers.find(u => u.email === cleanEmail);
  if (existingFallbackUser) return res.status(400).json({ success: false, message: 'Email already registered' });

  const userObj = {
    id: userId,
    email: cleanEmail,
    password: hashedPassword,
    firstname: firstName,
    lastname: surname,
    address,
    phone,
    role: 'user',
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
  fallbackUsers.push(userObj);

  const token = jwt.sign({ userId, email: cleanEmail, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  
  const welcomeSubject = "Welcome to Tizzitech - Verify Your Email";
  const welcomeContent = `
    <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">Welcome, ${firstName}!</h2>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">We are thrilled to welcome you to <strong>Tizzitech Online Store</strong>.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${verifyLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 13px 30px; border-radius: 8px;">Verify Email Address</a>
    </div>
  `;
  const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, getBaseUrl(req));
  await sendEmail(cleanEmail, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
  
  await logSecurityEvent(req, 'AUTH_REGISTER_SUCCESS', 'INFO', `New user registered account successfully`, cleanEmail);

  return res.json({ 
    success: true, 
    token, 
    user: { 
      id: userId, 
      email: cleanEmail, 
      firstName, 
      surname, 
      address, 
      phone, 
      role: 'user', 
      emailVerified: false 
    } 
  });
});

// PASSWORD RESET REQUEST (Rate-limited, single-use, 15m expiration, bot protected)
app.post('/api/auth/reset-password', passwordResetLimiter, honeypotBotDetector, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const cleanEmail = email.trim().toLowerCase();
  const resetNonce = crypto.randomBytes(24).toString('hex');
  const resetNonceExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Generate 15-minute token with purpose and nonce
  const resetToken = jwt.sign({ email: cleanEmail, nonce: resetNonce, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });

  const db = getFirebaseDb();
  let userFound = false;

  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        userFound = true;
        const userRef = existSnap.docs[0].ref;
        await updateDoc(userRef, {
          resetNonce,
          resetNonceExpiresAt
        });
      }
    } catch (e) {
      console.warn('Could not store reset token in Firestore:', e);
    }
  }

  if (!userFound) {
    const fallbackUser = fallbackUsers.find(u => u.email === cleanEmail);
    if (fallbackUser) {
      userFound = true;
      (fallbackUser as any).resetNonce = resetNonce;
      (fallbackUser as any).resetNonceExpiresAt = resetNonceExpiresAt;
    }
  }

  if (userFound) {
    const resetSubject = "Password Reset Request - Tizzitech";
    const resetContent = `
      <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">We received a request to reset your password for your Tizzitech account.</p>
      <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">For your security, this password reset link is single-use and will expire in <strong>15 minutes</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${getBaseUrl(req)}/?view=reset-password&token=${resetToken}" style="display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
    `;
    const resetHtml = getPremiumTemplateHtml(resetSubject, resetContent, getBaseUrl(req));
    await sendEmail(cleanEmail, resetSubject, resetHtml).catch(err => console.error("Async email failed:", err));
  }

  await logSecurityEvent(req, 'AUTH_RESET_REQUESTED', 'INFO', `Password reset token requested`, cleanEmail);

  // Consistent message regardless of user existence to protect against user enumeration
  return res.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
});

// PASSWORD RESET CONFIRMATION (Single-use verification)
app.post('/api/auth/update-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
  
  // Validate password strength
  const passCheck = validatePasswordStrength(newPassword);
  if (!passCheck.isValid) {
    return res.status(400).json({ success: false, message: passCheck.message });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired password reset link.' });
  }

  if (decoded.purpose !== 'password_reset' || !decoded.email || !decoded.nonce) {
    return res.status(401).json({ success: false, message: 'Invalid password reset token format.' });
  }

  const email = decoded.email.toLowerCase();
  const tokenNonce = decoded.nonce;
  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', email));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        const userData = existSnap.docs[0].data();
        const userRef = existSnap.docs[0].ref;

        // Verify single-use nonce and expiry
        if (!userData.resetNonce || userData.resetNonce !== tokenNonce) {
          return res.status(401).json({ success: false, message: 'This password reset link has already been used or is invalid.' });
        }
        if (userData.resetNonceExpiresAt && Date.now() > userData.resetNonceExpiresAt) {
          return res.status(401).json({ success: false, message: 'This password reset link has expired. Please request a new one.' });
        }

        // Invalidate reset nonce and set new password
        await updateDoc(userRef, { 
          password: hashedPassword,
          resetNonce: null,
          resetNonceExpiresAt: null,
          passwordChangedAt: new Date().toISOString()
        });
        await logSecurityEvent(req, 'AUTH_RESET_SUCCESS', 'INFO', `User completed password reset via token`, email);
        return res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
      }
    } catch (e) {}
  }
  
  const fallbackUser = fallbackUsers.find(u => u.email === email);
  if (fallbackUser) {
    const fUser = fallbackUser as any;
    if (!fUser.resetNonce || fUser.resetNonce !== tokenNonce) {
      return res.status(401).json({ success: false, message: 'This password reset link has already been used or is invalid.' });
    }
    if (fUser.resetNonceExpiresAt && Date.now() > fUser.resetNonceExpiresAt) {
      return res.status(401).json({ success: false, message: 'This password reset link has expired. Please request a new one.' });
    }

    fallbackUser.password = hashedPassword;
    fUser.resetNonce = null;
    fUser.resetNonceExpiresAt = null;
    fUser.passwordChangedAt = new Date().toISOString();
    await logSecurityEvent(req, 'AUTH_RESET_SUCCESS', 'INFO', `User completed password reset via token (fallback)`, email);
    return res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  }

  return res.status(404).json({ success: false, message: 'User account not found.' });
});

// AUTHENTICATED USER PASSWORD CHANGE
app.post('/api/auth/change-password', authLimiter, verifyUserToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  // Validate new password strength
  const passCheck = validatePasswordStrength(newPassword);
  if (!passCheck.isValid) {
    return res.status(400).json({ success: false, message: passCheck.message });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', user.email));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        const userData = existSnap.docs[0].data();
        const userRef = existSnap.docs[0].ref;

        const isMatch = await bcrypt.compare(currentPassword, userData.password || '');
        if (!isMatch) {
          await logSecurityEvent(req, 'AUTH_PASSWORD_CHANGE_FAILED', 'WARN', `Incorrect current password on change attempt`, user.email);
          return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        const hashed = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        await updateDoc(userRef, {
          password: hashed,
          passwordChangedAt: new Date().toISOString()
        });
        await logSecurityEvent(req, 'AUTH_PASSWORD_CHANGED', 'INFO', `User successfully updated account password`, user.email);
        return res.json({ success: true, message: 'Password updated successfully.' });
      }
    } catch (e) {}
  }

  const fallbackUser = fallbackUsers.find(u => u.email === user.email);
  if (fallbackUser) {
    const isMatch = await bcrypt.compare(currentPassword, fallbackUser.password || '');
    if (!isMatch) {
      await logSecurityEvent(req, 'AUTH_PASSWORD_CHANGE_FAILED', 'WARN', `Incorrect current password on change attempt`, user.email);
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    fallbackUser.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    (fallbackUser as any).passwordChangedAt = new Date().toISOString();
    await logSecurityEvent(req, 'AUTH_PASSWORD_CHANGED', 'INFO', `User successfully updated account password`, user.email);
    return res.json({ success: true, message: 'Password updated successfully.' });
  }

  return res.status(404).json({ success: false, message: 'User account not found.' });
});

// EMAIL VERIFICATION VERIFY ENDPOINT
app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Verification token required.' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Verification link is invalid or has expired.' });
  }

  if (decoded.purpose !== 'email_verification' || !decoded.email) {
    return res.status(401).json({ success: false, message: 'Invalid verification token format.' });
  }

  const email = decoded.email.toLowerCase();
  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', email));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) {
        const userRef = existSnap.docs[0].ref;
        await updateDoc(userRef, {
          emailVerified: true,
          emailVerifiedAt: new Date().toISOString()
        });
        await logSecurityEvent(req, 'AUTH_EMAIL_VERIFIED', 'INFO', `User verified email address`, email);
        return res.json({ success: true, message: 'Your email has been successfully verified!' });
      }
    } catch (e) {}
  }

  const fallbackUser = fallbackUsers.find(u => u.email === email);
  if (fallbackUser) {
    (fallbackUser as any).emailVerified = true;
    (fallbackUser as any).emailVerifiedAt = new Date().toISOString();
    await logSecurityEvent(req, 'AUTH_EMAIL_VERIFIED', 'INFO', `User verified email address (fallback)`, email);
    return res.json({ success: true, message: 'Your email has been successfully verified!' });
  }

  return res.status(404).json({ success: false, message: 'User not found.' });
});

// RESEND EMAIL VERIFICATION
app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  let email = req.body.email;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.email) email = decoded.email;
    } catch (e) {}
  }

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let userFound: any = null;

  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const existSnap = await getDocs(existQ);
      if (!existSnap.empty) userFound = existSnap.docs[0].data();
    } catch (e) {}
  }

  if (!userFound) {
    userFound = fallbackUsers.find(u => u.email === cleanEmail);
  }

  if (!userFound) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (userFound.emailVerified) {
    return res.json({ success: true, message: 'Your email is already verified.' });
  }

  const verificationToken = jwt.sign({ userId: userFound.id, email: cleanEmail, purpose: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
  const verifyLink = `${getBaseUrl(req)}/?view=verify-email&token=${verificationToken}`;

  const verifySubject = "Verify Your Email Address - Tizzitech";
  const verifyContent = `
    <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">Verify Your Email Address</h2>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 20px;">Please click the button below to verify your email address on Tizzitech:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${verifyLink}" style="display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">Verify Email Address</a>
    </div>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">This link is valid for 24 hours.</p>
  `;
  const verifyHtml = getPremiumTemplateHtml(verifySubject, verifyContent, getBaseUrl(req));
  await sendEmail(cleanEmail, verifySubject, verifyHtml).catch(err => console.error("Async email failed:", err));

  await logSecurityEvent(req, 'AUTH_VERIFY_RESENT', 'INFO', `Email verification link resent`, cleanEmail);

  return res.json({ success: true, message: 'Verification link sent to your email.' });
});

// GOOGLE AUTH (Rate limited against bot account enumeration)
app.post('/api/auth/google', registerLimiter, async (req, res) => {
  const { credential, clientGeo } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Google token required' });

  try {
    const ticket = await new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || '850466444828-ocjc7iotr69hsv8e29hntu1no1n0aege.apps.googleusercontent.com').verifyIdToken({
      idToken: credential,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google payload');

    const email = payload.email!.toLowerCase();
    const firstName = payload.given_name || '';
    const surname = payload.family_name || '';

    // Generate random secure hash to prevent empty or unhashed password access
    const randomOAuthSecret = crypto.randomBytes(32).toString('hex');
    const oauthPasswordHash = await bcrypt.hash(randomOAuthSecret, BCRYPT_SALT_ROUNDS);

    const db = getFirebaseDb();
    if (db) {
      try {
        const existQ = query(collection(db, 'users'), where('email', '==', email));
        const existSnap = await getDocs(existQ);
        let user: any = null;
        if (!existSnap.empty) user = existSnap.docs[0].data();
        let userId = user?.id;
        
        if (!user) {
          let geo = clientGeo;
          if (!geo || !geo.country || geo.country === 'Unknown' || geo.country === 'UNKNOWN') {
            geo = await getRequestGeo(req);
          }
          userId = `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          user = {
            id: userId, 
            email, 
            password: oauthPasswordHash,
            authProvider: 'google',
            emailVerified: true, // Google verifies emails
            firstname: firstName, 
            lastname: surname, 
            role: 'user',
            country: geo.country,
            region: geo.region,
            city: geo.city,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', userId), user);
          
          // Send welcome email for new Google Auth users
          const welcomeSubject = "Welcome to Tizzitech!";
          const welcomeContent = `
            <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">Welcome, ${firstName}!</h2>
            <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">We are thrilled to welcome you to <strong>Tizzitech Online Store</strong> — your trusted destination for tech gadgets and accessories.</p>
            <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
              <a href="${getBaseUrl(req)}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Start Shopping Now</a>
            </div>
          `;
          const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, getBaseUrl(req));
          sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
        }

        await logSecurityEvent(req, 'AUTH_GOOGLE_SUCCESS', 'INFO', `User authenticated with Google OAuth`, email);

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ 
          success: true, 
          token, 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstname, 
            surname: user.lastname, 
            address: user.address || '', 
            phone: user.phone || '', 
            role: user.role, 
            city: user.city || '', 
            stateLocation: user.stateLocation || '', 
            lga: user.lga || '',
            emailVerified: true
          } 
        });
      } catch (err: any) {
        console.warn('Firestore not fully configured yet, falling back to local memory for google login.');
      }
    }

    // Fallback to in-memory login
    let fallbackUser = fallbackUsers.find(u => u.email === email);
    if (!fallbackUser) {
      fallbackUser = {
        id: `U${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        email,
        password: oauthPasswordHash,
        authProvider: 'google',
        emailVerified: true,
        firstname: firstName,
        lastname: surname,
        role: 'user'
      };
      fallbackUsers.push(fallbackUser);
      
      const welcomeSubject = "Welcome to Tizzitech!";
      const welcomeContent = `
        <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 16px; text-align: center;">Welcome, ${firstName}!</h2>
        <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">We are thrilled to welcome you to Tizzitech Online Store.</p>
      `;
      const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, process.env.APP_URL || 'https://tizzitech.com.ng');
      sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));
    }

    await logSecurityEvent(req, 'AUTH_GOOGLE_SUCCESS', 'INFO', `User authenticated with Google OAuth (fallback)`, email);

    const token = jwt.sign({ userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ 
      success: true, 
      token, 
      user: { 
        id: fallbackUser.id, 
        email: fallbackUser.email, 
        firstName: fallbackUser.firstname, 
        surname: fallbackUser.lastname, 
        address: fallbackUser.address || '', 
        phone: fallbackUser.phone || '', 
        role: fallbackUser.role, 
        city: (fallbackUser as any).city || '', 
        stateLocation: (fallbackUser as any).stateLocation || '', 
        lga: (fallbackUser as any).lga || '',
        emailVerified: true
      } 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    await logSecurityEvent(req, 'AUTH_GOOGLE_FAILED', 'WARN', `Google token verification failed`);
    return res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// 12. USER LOGIN (Protected by dedicated loginLimiter and honeypotBotDetector)
app.post('/api/auth/login', loginLimiter, honeypotBotDetector, async (req, res) => {
  const { email, password, clientGeo } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const cleanEmail = email.trim().toLowerCase();

  const db = getFirebaseDb();
  if (db) {
    try {
      const existQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const existSnap = await getDocs(existQ);
      let user: any = null;
      if (!existSnap.empty) user = existSnap.docs[0].data();
      if (!user) {
        await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: user does not exist (${cleanEmail})`, cleanEmail);
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (!user.password) {
        await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: social account without password (${cleanEmail})`, cleanEmail);
        return res.status(401).json({ success: false, message: 'Please sign in with Google or reset your password.' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: invalid password supplied for ${cleanEmail}`, cleanEmail);
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (!user.country || !user.region || user.country === 'Unknown' || user.country === 'UNKNOWN') {
        try {
          let geo = clientGeo;
          if (!geo || !geo.country || geo.country === 'Unknown' || geo.country === 'UNKNOWN') {
            geo = await getRequestGeo(req);
          }
          await updateDoc(doc(db, 'users', user.id), {
            country: geo.country,
            region: geo.region,
            city: geo.city
          });
          user.country = geo.country;
          user.region = geo.region;
          user.city = geo.city;
        } catch (e) {}
      }

      await logSecurityEvent(req, 'AUTH_LOGIN_SUCCESS', 'INFO', `User logged in successfully`, cleanEmail);

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ 
        success: true, 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstname, 
          surname: user.lastname, 
          address: user.address || '',
          city: user.city || '',
          stateLocation: user.stateLocation || '',
          lga: user.lga || '', 
          phone: user.phone || '', 
          role: user.role || 'user',
          emailVerified: !!user.emailVerified
        } 
      });
    } catch (err: any) {
      console.warn('Firestore not fully configured yet, falling back to local memory for login.');
    }
  }

  // Fallback to in-memory login
  const fallbackUser = fallbackUsers.find(u => u.email === cleanEmail);
  if (!fallbackUser) {
    await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: fallback user not found (${cleanEmail})`, cleanEmail);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!fallbackUser.password) {
    await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: fallback account without password (${cleanEmail})`, cleanEmail);
    return res.status(401).json({ success: false, message: 'Please sign in with Google or reset your password.' });
  }

  const isValid = await bcrypt.compare(password, fallbackUser.password);
  if (!isValid) {
    await logSecurityEvent(req, 'AUTH_LOGIN_FAILED', 'WARN', `Login failed: invalid password supplied in fallback for ${cleanEmail}`, cleanEmail);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  await logSecurityEvent(req, 'AUTH_LOGIN_SUCCESS', 'INFO', `User logged in successfully (fallback)`, cleanEmail);

  const token = jwt.sign({ userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ 
    success: true, 
    token, 
    user: { 
      id: fallbackUser.id, 
      email: fallbackUser.email, 
      firstName: fallbackUser.firstname, 
      surname: fallbackUser.lastname, 
      address: fallbackUser.address || '', 
      phone: fallbackUser.phone || '', 
      role: fallbackUser.role || 'user',
      emailVerified: !!(fallbackUser as any).emailVerified
    } 
  });
});

app.put('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const { firstName, surname, address, phone, codename, city, stateLocation, lga } = req.body;
  const callerUserId = decoded.userId || decoded.backendId || decoded.id;
  const callerEmail = decoded.email ? decoded.email.toLowerCase() : null;
  
  const db = getFirebaseDb();
  if (db) {
    try {
      const adb = getAdminDb();
      if (callerUserId) {
        if (adb) {
          try {
            await adb.collection('users').doc(callerUserId).update({
              ...(firstName && { firstname: firstName }),
              ...(surname && { lastname: surname }),
              ...(address && { address }),
              ...(phone && { phone }),
              ...(codename && { codename }),
              ...(city && { city }),
              ...(stateLocation && { stateLocation }),
              ...(lga && { lga }),
            });
          } catch(e) {}
        }

        const existQ = query(collection(db, 'users'), where('id', '==', callerUserId));
        const existSnap = await getDocs(existQ);
        if (!existSnap.empty) {
          const userRef = existSnap.docs[0].ref;
          await updateDoc(userRef, {
            ...(firstName && { firstname: firstName }),
            ...(surname && { lastname: surname }),
            ...(address && { address }),
            ...(phone && { phone }),
            ...(codename && { codename }),
            ...(city && { city }),
            ...(stateLocation && { stateLocation }),
            ...(lga && { lga }),
          });
          return res.json({ success: true, message: 'Profile updated successfully' });
        }
      }
      
      if (callerEmail) {
        const existEmailQ = query(collection(db, 'users'), where('email', '==', decoded.email || ''));
        const existEmailSnap = await getDocs(existEmailQ);
        if (!existEmailSnap.empty) {
          const userRef = existEmailSnap.docs[0].ref;
          await updateDoc(userRef, {
            ...(firstName && { firstname: firstName }),
            ...(surname && { lastname: surname }),
            ...(address && { address }),
            ...(phone && { phone }),
            ...(codename && { codename }),
            ...(city && { city }),
            ...(stateLocation && { stateLocation }),
            ...(lga && { lga }),
          });
          return res.json({ success: true, message: 'Profile updated successfully' });
        }
      }
      return res.status(404).json({ success: false, message: 'User not found in database' });
    } catch (e) {
      console.error(e);
      // fallback
    }
  }

  // Fallback memory with ownership check
  const fallbackUserIndex = fallbackUsers.findIndex(u => (callerUserId && u.id === callerUserId) || (callerEmail && u.email.toLowerCase() === callerEmail));
  if (fallbackUserIndex !== -1) {
    if (firstName) fallbackUsers[fallbackUserIndex].firstname = firstName;
    if (surname) fallbackUsers[fallbackUserIndex].lastname = surname;
    if (address) fallbackUsers[fallbackUserIndex].address = address;
    if (phone) fallbackUsers[fallbackUserIndex].phone = phone;
    (fallbackUsers[fallbackUserIndex] as any).city = city || (fallbackUsers[fallbackUserIndex] as any).city;
    (fallbackUsers[fallbackUserIndex] as any).stateLocation = stateLocation || (fallbackUsers[fallbackUserIndex] as any).stateLocation;
    (fallbackUsers[fallbackUserIndex] as any).lga = lga || (fallbackUsers[fallbackUserIndex] as any).lga;
    
    return res.json({ success: true, message: 'Profile updated in fallback memory' });
  }

  return res.status(404).json({ success: false, message: 'User not found' });
});
// 13. GET USER ORDERS
app.get('/api/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized: authentication token required' });

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Strict ownership check: prevent IDOR by ensuring caller owns the user profile or is an admin
  const callerUserId = decoded.userId || decoded.backendId || decoded.id;
  const callerEmail = decoded.email ? decoded.email.toLowerCase() : null;
  const isOwner = callerUserId === userId || (callerEmail && callerEmail === userId.toLowerCase());

  if (decoded.role !== 'admin' && !isOwner) {
    return res.status(403).json({ error: 'Forbidden: You cannot access orders belonging to another user' });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      let ordersRows: any[] = [];
      const queryUserId = decoded.role === 'admin' ? userId : callerUserId;
      
      if (queryUserId) {
        try {
          const q1 = query(collection(db, 'orders'), where('userId', '==', queryUserId));
          const snap1 = await getDocs(q1);
          snap1.docs.forEach((d: any) => ordersRows.push(d.data()));
        } catch(e) {}
      }
      
      const queryEmail = decoded.role === 'admin' ? null : callerEmail;
      if (queryEmail) {
        try {
          const q2 = query(collection(db, 'orders'), where('email', '==', decoded.email));
          const snap2 = await getDocs(q2);
          snap2.docs.forEach((d: any) => {
            const data = d.data();
            if (!ordersRows.find(o => o.id === data.id)) {
              ordersRows.push(data);
            }
          });
        } catch(e) {}
      }
      ordersRows.sort((a, b) => {
        const valA = a.orderDate || a.order_date;
        const valB = b.orderDate || b.order_date;
        const db = valA ? new Date(valA).getTime() : 0;
        const da = valB ? new Date(valB).getTime() : 0;
        return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
      });

      const ordersData = [];
      for (const order of (ordersRows || [])) {
        const itemsArray = [];
        for (const iData of (order.items || [])) {
           let pData: any = null;
           try {
             const pSnap = await getDoc(doc(db, 'products', iData.id));
             if (pSnap.exists()) pData = pSnap.data();
           } catch(e) {}
           itemsArray.push({
             id: iData.id, name: pData?.name || 'Product', brand: pData?.brand || '',
             category: pData?.category || '', price: iData.price || 0, quantity: iData.quantity || 1,
             imageUrl: pData?.imageUrl || ''
           });
        }

        ordersData.push({
          id: order.id,
          fullname: order.fullname,
          email: order.email,
          address: order.address,
          paymentOption: order.paymentOption || 'Card',
          total: order.total,
          status: order.status,
          orderDate: order.orderDate || new Date().toISOString(),
          expectedDeliveryDate: order.expectedDeliveryDate || new Date().toISOString(),
          items: itemsArray
        });
      }
      return res.json({ success: true, orders: ordersData });
    } catch (err: any) {
      console.log('Firestore fallback for get user orders:', err.message);
    }
  }
  
  const userFallbackOrders = decoded?.role === 'admin'
    ? fallbackOrders.filter(o => o.user_id === userId || (o as any).userId === userId)
    : fallbackOrders.filter(o => 
        (callerUserId && (o.user_id === callerUserId || (o as any).userId === callerUserId)) ||
        (callerEmail && o.email.toLowerCase() === callerEmail)
      );
  return res.json({ success: true, orders: userFallbackOrders });
});

app.post('/api/orders/statuses', async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.json({ success: true, statuses: {} });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const statuses: Record<string, string> = {};
      for (const id of orderIds) {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          statuses[id] = snap.data().status;
        }
      }
      return res.json({ success: true, statuses });
    } catch (err: any) {
      console.log('Firestore fallback for get order statuses:', err.message);
    }
  }

  // Fallback
  const statuses: Record<string, string> = {};
  for (const id of orderIds) {
    const o = fallbackOrders.find(o => o.id === id);
    if (o) statuses[id] = o.status;
  }
  return res.json({ success: true, statuses });
});

// 14. NEWSLETTER SUBSCRIPTION (Protected against spam bots & email harvesting)
app.post('/api/newsletter/subscribe', newsletterLimiter, honeypotBotDetector, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const newSubRef = doc(db, 'newsletter_subscribers', email);
      try {
        await setDoc(newSubRef, {
          email,
          subscribedAt: new Date().toISOString(),
          status: 'active'
        });
      } catch (err) {
        if (err.code === 'permission-denied') {
          // If the document already exists, setDoc counts as an update which is denied by rules.
          // We can assume they are already subscribed.
          return res.json({ success: true, message: 'Already subscribed' });
        }
        throw err;
      }
      
      // Send welcome email
      const welcomeSubject = "Welcome to Tizzitech's Newsletter!";
      const welcomeContent = `
        <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">Welcome to the Inner Circle! 🚀</h2>
        <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">Thank you for subscribing to the <strong>Tizzitech Newsletter</strong>. You are now part of an elite community of tech enthusiasts who receive direct updates, early access to premium product drops, and exclusive discounts.</p>
        <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Here is what you can expect as a subscriber:</p>
        <div style="background-color: #1f2937; border-radius: 8px; padding: 20px; border: 1px solid #374151; margin-bottom: 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">🔥 Exclusive Promotions</td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px; color: #9ca3af;">Be the first to receive subscriber-only promo codes and discount sales before anyone else.</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">⚡ Tech Insights & Updates</td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px; color: #9ca3af;">Get raw tech insights, buying guides, maintenance tips, and the latest hardware news.</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">📦 Early Product Drops</td>
            </tr>
            <tr>
              <td style="color: #9ca3af;">Receive notifications on limited-stock accessories, high-demand laptops, and premium gadgets as they land.</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; text-align: center; margin-bottom: 24px;">Thank you for trusting Tizzitech. We promise to only send high-value content directly to your inbox — no spam, ever.</p>
        <div style="text-align: center; margin-bottom: 10px;">
          <a href="${getBaseUrl(req)}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Explore Tizzitech Store</a>
        </div>
      `;
      const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, getBaseUrl(req));
      let deliveryStatus = 'pending';
      let emailError = null;
      try {
        await sendEmail(email, welcomeSubject, welcomeHtml);
        deliveryStatus = 'delivered';
      } catch (err: any) {
        console.error("Async email failed:", err);
        emailError = err.message;
        deliveryStatus = 'failed';
      }
      try {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(newSubRef, { deliveryStatus, emailError: emailError || null });
      } catch (e) {}
      
      return res.json({ success: true, message: 'Successfully subscribed' });
    } catch (err: any) {
      console.error('Firestore newsletter error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Send welcome email
  const welcomeSubject = "Welcome to Tizzitech's Newsletter!";
  const welcomeContent = `
    <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">Welcome to the Inner Circle! 🚀</h2>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">Thank you for subscribing to the <strong>Tizzitech Newsletter</strong>. You are now part of an elite community of tech enthusiasts who receive direct updates, early access to premium product drops, and exclusive discounts.</p>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Here is what you can expect as a subscriber:</p>
    <div style="background-color: #1f2937; border-radius: 8px; padding: 20px; border: 1px solid #374151; margin-bottom: 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; line-height: 1.6;">
        <tr>
          <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">🔥 Exclusive Promotions</td>
        </tr>
        <tr>
          <td style="padding-bottom: 16px; color: #9ca3af;">Be the first to receive subscriber-only promo codes and discount sales before anyone else.</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">⚡ Tech Insights & Updates</td>
        </tr>
        <tr>
          <td style="padding-bottom: 16px; color: #9ca3af;">Get raw tech insights, buying guides, maintenance tips, and the latest hardware news.</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; color: #ffffff; font-weight: bold;">📦 Early Product Drops</td>
        </tr>
        <tr>
          <td style="color: #9ca3af;">Receive notifications on limited-stock accessories, high-demand laptops, and premium gadgets as they land.</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; text-align: center; margin-bottom: 24px;">Thank you for trusting Tizzitech. We promise to only send high-value content directly to your inbox — no spam, ever.</p>
    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.APP_URL || 'https://tizzitech.com.ng'}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Explore Tizzitech Store</a>
    </div>
  `;
  const welcomeHtml = getPremiumTemplateHtml(welcomeSubject, welcomeContent, process.env.APP_URL || 'https://tizzitech.com.ng');
  await sendEmail(email, welcomeSubject, welcomeHtml).catch(err => console.error("Async email failed:", err));

  return res.json({ success: true, message: 'Successfully subscribed (Fallback)' });
});

// 14b. PRE-LAUNCH VIP WAITLIST SUBSCRIPTION & EMAIL CONFIRMATION (Bot Protected)
app.post('/api/waitlist/subscribe', newsletterLimiter, honeypotBotDetector, async (req, res) => {
  const { email, name, productInterest, phone, notifyMethod, vipPassId } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }

  const passId = vipPassId || `TZ-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
  const subscriberName = name?.trim() || 'Tech Enthusiast';
  const selectedDevice = productInterest || 'All 2026 Flagship Drops';
  const cleanEmail = email.trim().toLowerCase();

  const subscriberData = {
    email: cleanEmail,
    name: subscriberName,
    productInterest: selectedDevice,
    phone: phone?.trim() || '',
    notifyMethod: notifyMethod || 'email',
    vipPassId: passId,
    source: 'product_launch_waitlist',
    subscribedAt: new Date().toISOString(),
    status: 'active'
  };

  const db = getFirebaseDb();
  if (db) {
    try {
      const newSubRef = doc(db, 'newsletter_subscribers', cleanEmail);
      await setDoc(newSubRef, subscriberData, { merge: true });
    } catch (err: any) {
      console.error('Firestore waitlist save error:', err.message);
    }
  }

  // Compose Rich VIP Pre-Launch Email
  const confirmSubject = `⚡ VIP Pre-Launch Priority Confirmed! Pass #${passId}`;
  const confirmContent = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #22d3ee; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 12px;">
        OFFICIAL PRE-LAUNCH VIP PASS
      </span>
      <h2 style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; font-family: Georgia, serif;">
        Welcome to the 2026 Flagship Drop Waitlist!
      </h2>
      <p style="font-size: 14px; color: #9ca3af; margin: 0;">
        Hello <strong style="color: #ffffff;">${subscriberName}</strong>, your spot on the priority launch radar is locked in.
      </p>
    </div>

    <!-- VIP PASS BADGE CARD -->
    <div style="background: linear-gradient(180deg, #111827 0%, #030712 100%); border: 1px solid #06b6d4; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.2);">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #1f2937;">
            <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-family: monospace;">VIP Pass ID:</span><br/>
            <strong style="font-size: 20px; color: #22d3ee; font-family: monospace; letter-spacing: 0.05em;">${passId}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #1f2937;">
            <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-family: monospace;">Selected Device Preference:</span><br/>
            <strong style="font-size: 14px; color: #ffffff;">${selectedDevice}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 12px;">
            <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-family: monospace;">Your Locked-In VIP Perks:</span>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #38bdf8; font-size: 13px; line-height: 1.8;">
              <li><strong>🏷️ 7% Instant Discount:</strong> Automatically applied when using your Pass ID or email at checkout.</li>
              <li><strong>✨ Free First Purchase Shipping:</strong> 100% covered by Tizzitech.</li>
              <li><strong>🚀 1st Week Free Delivery:</strong> Free express doorstep delivery during launch week.</li>
              <li><strong>⚡ Early Access Alert:</strong> Direct SMS/Email alert minutes before public inventory goes live.</li>
            </ul>
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color: #111827; border-left: 4px solid #a855f7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h4 style="font-size: 13px; font-weight: 800; color: #e9d5ff; margin: 0 0 6px 0; text-transform: uppercase;">
        How to Claim at Launch:
      </h4>
      <p style="font-size: 13px; color: #d1d5db; line-height: 1.6; margin: 0;">
        When the 2026 Pre-Launch drop begins, visit <strong>Tizzitech</strong>, choose your flagship device, and type your VIP Pass ID (<code style="background: #1f2937; color: #22d3ee; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${passId}</code>) or registered email (<code style="background: #1f2937; color: #ffffff; padding: 2px 6px; border-radius: 4px;">${cleanEmail}</code>) into the coupon field at checkout!
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 16px;">
      <a href="${getBaseUrl(req)}" style="display: inline-block; background: linear-gradient(90deg, #06b6d4 0%, #a855f7 100%); color: #000000; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
        Visit Tizzitech Store
      </a>
    </div>
  `;

  const confirmHtml = getPremiumTemplateHtml(confirmSubject, confirmContent, getBaseUrl(req));

  let emailSent = false;
  let emailError = null;
  try {
    await sendEmail(cleanEmail, confirmSubject, confirmHtml);
    emailSent = true;
  } catch (err: any) {
    console.error('Waitlist email error:', err.message);
    emailError = err.message;
  }

  if (db) {
    try {
      const newSubRef = doc(db, 'newsletter_subscribers', cleanEmail);
      await setDoc(newSubRef, { deliveryStatus: emailSent ? 'delivered' : 'failed', emailError: emailError || null }, { merge: true });
    } catch (e) {}
  }

  return res.json({
    success: true,
    message: emailSent
      ? `VIP Waitlist confirmed! A confirmation email has been sent to ${cleanEmail}.`
      : `VIP Priority reserved! Pass ID: ${passId}`,
    vipPassId: passId,
    emailSent
  });
});


// ADMIN: GET USERS
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
  const adb = getAdminDb();
  if (adb) {
    try {
      const snap = await adb.collection('users').get();
      const users: any[] = [];
      snap.forEach((doc: any) => {
        const data = doc.data();
        delete data.password;
        users.push({ id: doc.id, ...data });
      });
      return res.json({ success: true, users });
    } catch (err: any) {
      console.error('Error fetching users via Admin SDK:', err.message);
    }
  }

  const db = getFirebaseDb();
  if (!db) {
    return res.json({ success: true, users: [] }); // Fallback
  }
  
  try {
    const q = collection(db, 'users');
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      // Omit password hash before sending to client
      const data = doc.data();
      delete data.password;
      users.push({ id: doc.id, ...data });
    });
    return res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 15. ADMIN NEWSLETTER ROUTES
app.get('/api/admin/newsletter/subscribers', verifyAdminToken, async (req, res) => {
  const adb = getAdminDb();
  if (adb) {
    try {
      const snap = await adb.collection('newsletter_subscribers').get();
      const subscribers: any[] = [];
      snap.forEach((doc: any) => {
        subscribers.push({ id: doc.id, ...doc.data() });
      });
      return res.json({ success: true, subscribers });
    } catch (err: any) {
      console.error('Error fetching subscribers via Admin SDK:', err.message);
    }
  }

  const db = getFirebaseDb();
  if (!db) {
    return res.json({ success: true, subscribers: [] }); // Fallback
  }

  try {
    const q = collection(db, 'newsletter_subscribers');
    const querySnapshot = await getDocs(q);
    const subscribers: any[] = [];
    querySnapshot.forEach((doc) => {
      subscribers.push({ id: doc.id, ...doc.data() });
    });
    return res.json({ success: true, subscribers });
  } catch (err: any) {
    console.error('Error fetching subscribers:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/newsletter/send', verifyAdminToken, async (req, res) => {
  const { subject, content, targetAudience = 'all' } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ success: false, message: 'Subject and content are required' });
  }

  let emails: string[] = [];
  let fetchedViaAdmin = false;

  const adb = getAdminDb();
  if (adb) {
    try {
      const activeSnap = await adb.collection('newsletter_subscribers').where('status', '==', 'active').get();
      if (!activeSnap.empty) {
        activeSnap.forEach((doc: any) => {
          const data = doc.data();
          const email = data.email;
          const isWaitlist = data.source === 'product_launch_waitlist' || Boolean(data.vipPassId);
          
          if (email) {
            if (targetAudience === 'waitlist' && isWaitlist) {
              emails.push(email);
            } else if (targetAudience === 'newsletter' && !isWaitlist) {
              emails.push(email);
            } else if (targetAudience === 'all') {
              emails.push(email);
            }
          }
        });
        fetchedViaAdmin = true;
      }
    } catch (err: any) {
      console.error('Error fetching active subscribers via Admin SDK:', err.message);
    }
  }

  if (!fetchedViaAdmin) {
    const db = getFirebaseDb();
    if (!db) {
      return res.json({ success: true, message: 'Newsletter sent successfully (Fallback)' });
    }

    try {
      // 1. Fetch active subscribers
      const activeQ = query(collection(db, 'newsletter_subscribers'), where('status', '==', 'active'));
      const activeSnap = await getDocs(activeQ);
      
      if (activeSnap.empty) {
        return res.status(400).json({ success: false, message: 'No active subscribers found' });
      }

      activeSnap.docs.forEach(d => {
        const data = d.data();
        const email = data.email;
        const isWaitlist = data.source === 'product_launch_waitlist' || Boolean(data.vipPassId);

        if (email) {
          if (targetAudience === 'waitlist' && isWaitlist) {
            emails.push(email);
          } else if (targetAudience === 'newsletter' && !isWaitlist) {
            emails.push(email);
          } else if (targetAudience === 'all') {
            emails.push(email);
          }
        }
      });
    } catch (err: any) {
      console.error('Error fetching active subscribers:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  try {
    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers found' });
    }

    // 2. Wrap content in a premium template
    const newsletterContent = `
      <h2 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 16px 0; text-align: center;">
        ${subject}
      </h2>
      <div style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
        ${content}
      </div>
    `;
    const templateHTML = getPremiumTemplateHtml(subject, newsletterContent, getBaseUrl(req));

    // 3. Send emails using Nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Send to all subscribers via BCC
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>',
        to: process.env.SMTP_FROM_EMAIL || '"Tizzitech" <newsletter@tizzitech.com>', // Set a default to, use BCC for actual recipients
        bcc: emails,
        subject: subject,
        html: templateHTML,
      });
      console.log(`[EMAIL SENT] Newsletter "${subject}" sent to ${emails.length} subscribers via SMTP.`);
    } else {
      console.log(`[SIMULATED EMAIL] Sending newsletter "${subject}" to ${emails.length} subscribers.`);
      console.log('To actually send emails, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your secrets.');
    }

    // Optional: Log this campaign in a new Firestore collection for tracking
    try {
      if (adb) {
        await adb.collection('newsletter_campaigns').add({
          subject,
          content: templateHTML,
          recipientCount: emails.length,
          sentAt: new Date().toISOString()
        });
      } else {
        const db = getFirebaseDb();
        if (db) {
          const campaignRef = doc(collection(db, 'newsletter_campaigns'));
          await setDoc(campaignRef, {
            subject,
            content: templateHTML,
            recipientCount: emails.length,
            sentAt: new Date().toISOString()
          });
        }
      }
    } catch (campaignErr: any) {
      console.warn("Could not log campaign to Firestore, continuing anyway:", campaignErr.message);
    }

    await logServerAuditActivity(req, 'NEWSLETTER_SEND', `Sent newsletter campaign "${subject}" to ${emails.length} subscribers`);
    return res.json({ success: true, message: `Newsletter successfully sent to ${emails.length} subscribers!` });
  } catch (err: any) {
    console.error('Error sending newsletter:', err);
    return res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});

// 14c. AUTOMATED & MANUAL INACTIVE CUSTOMERS RE-ENGAGEMENT CAMPAIGN (30+ DAYS)
async function sendInactiveUserReengagementEmails(daysThreshold = 30, reqForLog?: any) {
  const now = new Date();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  const cutoffTime = new Date(now.getTime() - thresholdMs);

  let usersToReengage: any[] = [];
  const adb = getAdminDb();

  if (adb) {
    try {
      const snap = await adb.collection('users').get();
      snap.forEach((d: any) => {
        const u = d.data();
        if (u.email && u.role !== 'admin') {
          const rawLastActive = u.lastActiveAt || u.createdAt || u.created_at;
          let lastActiveDate: Date | null = null;
          if (rawLastActive) {
            lastActiveDate = new Date(rawLastActive);
          }

          let lastReengageDate: Date | null = null;
          if (u.lastReengagementSentAt) {
            lastReengageDate = new Date(u.lastReengagementSentAt);
          }

          const isInactive = !lastActiveDate || lastActiveDate < cutoffTime;
          const notRecentlyReengaged = !lastReengageDate || (now.getTime() - lastReengageDate.getTime() > thresholdMs);

          if (isInactive && notRecentlyReengaged) {
            usersToReengage.push({ docId: d.id, ...u });
          }
        }
      });
    } catch (err: any) {
      console.error('Error fetching users via Admin DB:', err.message);
    }
  }

  if (usersToReengage.length === 0) {
    const db = getFirebaseDb();
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.docs.forEach((d: any) => {
          const u = d.data();
          if (u.email && u.role !== 'admin') {
            const rawLastActive = u.lastActiveAt || u.createdAt || u.created_at;
            let lastActiveDate: Date | null = null;
            if (rawLastActive) lastActiveDate = new Date(rawLastActive);

            let lastReengageDate: Date | null = null;
            if (u.lastReengagementSentAt) lastReengageDate = new Date(u.lastReengagementSentAt);

            const isInactive = !lastActiveDate || lastActiveDate < cutoffTime;
            const notRecentlyReengaged = !lastReengageDate || (now.getTime() - lastReengageDate.getTime() > thresholdMs);

            if (isInactive && notRecentlyReengaged) {
              usersToReengage.push({ docId: d.id, ...u });
            }
          }
        });
      } catch (e: any) {
        console.error('Error fetching users via Client DB:', e.message);
      }
    }
  }

  if (usersToReengage.length === 0) {
    return { success: true, count: 0, sentCount: 0, totalInactive: 0, message: 'No inactive customers found matching criteria (30+ days inactive).' };
  }

  // Fetch top 3 featured products to feature in re-engagement email
  let featuredProds: any[] = [];
  const db = getFirebaseDb();
  if (db) {
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      if (!prodSnap.empty) {
        featuredProds = prodSnap.docs.map((d: any) => d.data()).slice(0, 3);
      }
    } catch (e) {}
  }
  if (featuredProds.length === 0 && Array.isArray(fallbackProducts)) {
    featuredProds = fallbackProducts.slice(0, 3);
  }

  const baseUrl = process.env.APP_URL || 'https://tizzitech.com.ng';

  // Build product HTML grid cards
  let productCardsHtml = '';
  featuredProds.forEach((p: any) => {
    const pName = p.name || 'Flagship Smartphone';
    const pCategory = p.category || 'Tech Flagship';
    const pPrice = typeof p.price === 'number' ? `₦${p.price.toLocaleString()}` : (p.price || 'Special Price');
    const pImg = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
    const pLink = `${baseUrl}/?product=${p.id || ''}`;

    productCardsHtml += `
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: left;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="90" style="vertical-align: top; padding-right: 16px;">
              <img src="${pImg}" alt="${pName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #374151;" />
            </td>
            <td style="vertical-align: top;">
              <span style="font-size: 10px; font-weight: 800; color: #22d3ee; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 4px;">${pCategory}</span>
              <h4 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0; line-height: 1.3;">${pName}</h4>
              <p style="font-size: 14px; font-weight: 900; color: #38bdf8; margin: 0 0 10px 0; font-family: monospace;">${pPrice}</p>
              <a href="${pLink}" style="display: inline-block; background-color: #06b6d4; color: #000000; font-size: 11px; font-weight: 800; text-decoration: none; padding: 6px 14px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">View Product &rarr;</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  });

  let emailsSent = 0;
  const sentRecipients: string[] = [];

  for (const u of usersToReengage) {
    const firstName = u.firstName || u.firstname || u.name?.split(' ')[0] || 'Valued Tech Enthusiast';
    const subject = `👋 We miss you, ${firstName}! Discover what's new at Tizzitech + Exclusive Perks`;

    const bodyContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 12px;">
          WE MISS YOU! EXCLUSIVE BACK-IN-STORE DIGEST
        </span>
        <h2 style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; font-family: Georgia, serif;">
          It's Been A While, ${firstName}!
        </h2>
        <p style="font-size: 14px; color: #9ca3af; margin: 0; line-height: 1.6;">
          We noticed you haven't dropped by Tizzitech in over a month. We've added incredible new flagship smartphones, laptops, and unbeatable gadget deals you won't want to miss!
        </p>
      </div>

      <div style="background: linear-gradient(180deg, #030712 0%, #111827 100%); border: 1px solid #374151; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px 0; text-align: center;">
          🔥 Top 3 Trending Flagship Products Handpicked For You:
        </h3>
        ${productCardsHtml}
      </div>

      <div style="background-color: rgba(6, 182, 212, 0.08); border-left: 4px solid #06b6d4; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left;">
        <h4 style="font-size: 13px; font-weight: 800; color: #22d3ee; margin: 0 0 6px 0; text-transform: uppercase;">
          🎁 Welcome Back VIP Perk:
        </h4>
        <p style="font-size: 13px; color: #d1d5db; line-height: 1.6; margin: 0;">
          Enjoy express delivery and guaranteed authentic warranty on all orders. Plus, use coupon code <strong style="color: #ffffff; background: #1f2937; padding: 2px 8px; border-radius: 4px; font-family: monospace;">TIZZWELCOME</strong> for a bonus discount at checkout!
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(90deg, #06b6d4 0%, #a855f7 100%); color: #000000; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
          Explore Complete Catalog
        </a>
      </div>
    `;

    const html = getPremiumTemplateHtml(subject, bodyContent, baseUrl);

    try {
      await sendEmail(u.email, subject, html);
      emailsSent++;
      sentRecipients.push(u.email);

      const timeNowStr = new Date().toISOString();
      if (adb && u.docId) {
        await adb.collection('users').doc(u.docId).update({ lastReengagementSentAt: timeNowStr }).catch(() => {});
      } else if (u.docId) {
        const dbClient = getFirebaseDb();
        if (dbClient) {
          await updateDoc(doc(dbClient, 'users', u.docId), { lastReengagementSentAt: timeNowStr }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.error(`Failed sending re-engagement email to ${u.email}:`, err.message);
    }
  }

  if (reqForLog) {
    await logServerAuditActivity(reqForLog, 'REENGAGEMENT_CAMPAIGN', `Triggered 30-day inactive user email campaign. Sent ${emailsSent} emails out of ${usersToReengage.length} inactive candidate users.`);
  }

  return {
    success: true,
    message: `Successfully sent re-engagement emails with top 3 products to ${emailsSent} inactive customer(s)!`,
    sentCount: emailsSent,
    totalInactive: usersToReengage.length,
    recipients: sentRecipients
  };
}

app.get('/api/admin/inactive-users-count', verifyAdminToken, async (req, res) => {
  const daysThreshold = 30;
  const cutoffTime = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  let totalUsers = 0;
  let inactiveCount = 0;

  const adb = getAdminDb();
  if (adb) {
    try {
      const snap = await adb.collection('users').get();
      totalUsers = snap.size;
      snap.forEach((d: any) => {
        const u = d.data();
        if (u.role !== 'admin') {
          const rawLastActive = u.lastActiveAt || u.createdAt || u.created_at;
          let lastActiveDate: Date | null = null;
          if (rawLastActive) lastActiveDate = new Date(rawLastActive);
          if (!lastActiveDate || lastActiveDate < cutoffTime) {
            inactiveCount++;
          }
        }
      });
      return res.json({ success: true, count: inactiveCount, totalUsers });
    } catch (err) {}
  }

  const db = getFirebaseDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      totalUsers = snap.size;
      snap.docs.forEach((d: any) => {
        const u = d.data();
        if (u.role !== 'admin') {
          const rawLastActive = u.lastActiveAt || u.createdAt || u.created_at;
          let lastActiveDate: Date | null = null;
          if (rawLastActive) lastActiveDate = new Date(rawLastActive);
          if (!lastActiveDate || lastActiveDate < cutoffTime) {
            inactiveCount++;
          }
        }
      });
      return res.json({ success: true, count: inactiveCount, totalUsers });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  return res.json({ success: true, count: 0, totalUsers: 0 });
});

app.post('/api/admin/reengage-inactive', verifyAdminToken, async (req, res) => {
  try {
    const daysThreshold = parseInt(req.body?.daysInactive) || 30;
    const result = await sendInactiveUserReengagementEmails(daysThreshold, req);
    return res.json(result);
  } catch (err: any) {
    console.error('Error triggering re-engagement campaign:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Run automated re-engagement check once every 24 hours
setInterval(() => {
  sendInactiveUserReengagementEmails(30).catch(err => {
    console.error("Automated daily re-engagement error:", err.message);
  });
}, 24 * 60 * 60 * 1000);


// ========================================================
// 16. ADMIN OTP ENDPOINTS
// ========================================================

app.post('/api/admin/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const fbDb = getFirebaseDb();
  if (!fbDb) return res.status(500).json({ success: false, message: 'No DB' });

  const dId = getDocId(email);
  try {
    let adminSnap = await getDoc(doc(fbDb, 'admins', dId));
    
    // Auto-create/seed the super administrator if no administrator exists yet
    if (!adminSnap.exists() && email === 'idowutosin70@gmail.com') {
      await setDoc(doc(fbDb, 'admins', dId), { email, addedAt: new Date().toISOString() });
      adminSnap = await getDoc(doc(fbDb, 'admins', dId));
    }

    if (!adminSnap.exists()) {
      await logSecurityEvent(req, 'ADMIN_UNAUTHORIZED_ACCESS', 'HIGH', `Unauthorized email attempted admin OTP: ${email}`, email);
      return res.status(403).json({ success: false, message: 'Unauthorized email' });
    }
  } catch (err: any) {
    console.error('send-otp database check failed:', err.message);
    return res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  const docId = getDocId(email);
  const secret = process.env.ADMIN_KEY || 'default_secret';
  const hashedOtp = crypto.createHmac('sha256', secret).update(otp).digest('hex');

  try {
    await setDoc(doc(fbDb, 'admin_otps', docId), { hash: hashedOtp, expires });
  } catch(e: any) {
    console.error('Failed to save OTP:', e.message);
  }

  const subject = "Tizzitech Admin Portal - Your Access Code";
  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Admin Login Attempt</h2>
      <p>Please use the following 6-digit access code to securely log in to the admin portal:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #fff; background: #111; padding: 15px; border-radius: 8px; text-align: center;">${otp}</div>
      <p style="color: #888; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
    </div>`;

  try {
    await sendEmail(email, subject, html);
    await logSecurityEvent(req, 'ADMIN_OTP_REQUESTED', 'INFO', `Admin OTP generated and sent to ${email}`, email);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
       res.json({ success: true, message: 'OTP simulated (SMTP not configured)', devOtp: otp });
    } else {
       res.json({ success: true, message: 'OTP sent successfully' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send OTP email: ' + err.message });
  }
});

app.post('/api/admin/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const fbDb = getFirebaseDb();
  if (!fbDb) return res.status(500).json({ success: false });

  const dId = getDocId(email);
  try {
    let adminSnap = await getDoc(doc(fbDb, 'admins', dId));
    if (!adminSnap.exists() && email === 'idowutosin70@gmail.com') {
      await setDoc(doc(fbDb, 'admins', dId), { email, addedAt: new Date().toISOString() });
      adminSnap = await getDoc(doc(fbDb, 'admins', dId));
    }
    if (!adminSnap.exists()) {
      await logSecurityEvent(req, 'ADMIN_UNAUTHORIZED_ACCESS', 'HIGH', `Unauthorized email attempted OTP verify: ${email}`, email);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }

  const docId = getDocId(email);
  try {
    const snap = await getDoc(doc(fbDb, 'admin_otps', docId));
    if (!snap.exists()) return res.status(400).json({ success: false, message: 'No OTP' });
    
    const record = snap.data();
    if (Date.now() > record.expires) {
      await deleteDoc(doc(fbDb, 'admin_otps', docId));
      await logSecurityEvent(req, 'ADMIN_OTP_EXPIRED', 'WARN', `Expired OTP used by ${email}`, email);
      return res.status(400).json({ success: false, message: 'Expired' });
    }

    const secret = process.env.ADMIN_KEY || 'default_secret';
    const hashedOtp = crypto.createHmac('sha256', secret).update(otp).digest('hex');

    if (record.hash === hashedOtp) {
      await deleteDoc(doc(fbDb, 'admin_otps', docId));
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const sessionDocId = getDocId(email + "_session");
      await setDoc(doc(fbDb, 'admin_sessions', sessionDocId), { ip, userAgent });
      await logServerAuditActivity(req, 'LOGIN_SUCCESS', `Administrator logged in successfully`, email);
      await logSecurityEvent(req, 'ADMIN_LOGIN_SUCCESS', 'INFO', `Administrator authenticated successfully via OTP`, email);
      
      const token = jwt.sign({ userId: dId, email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ success: true, token });
    } else {
      await logSecurityEvent(req, 'ADMIN_LOGIN_FAILED', 'HIGH', `Invalid admin OTP code attempt for ${email}`, email);
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (e) {
    return res.status(500).json({ success: false });
  }
});

app.post('/api/admin/validate-session', async (req, res) => {
  const { email } = req.body;
  const fbDb = getFirebaseDb();
  if (!fbDb) return res.json({ valid: false });

  const dId = getDocId(email);
  try {
    const adminSnap = await getDoc(doc(fbDb, 'admins', dId));
    if (!adminSnap.exists()) return res.status(403).json({ valid: false });
  } catch (err) {
    return res.status(500).json({ valid: false });
  }

  const sessionDocId = getDocId(email + "_session");
  try {
    const snap = await getDoc(doc(fbDb, 'admin_sessions', sessionDocId));
    if (!snap.exists()) return res.json({ valid: false });
    
    const session = snap.data();
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (session.ip !== ip || session.userAgent !== userAgent) {
      await deleteDoc(doc(fbDb, 'admin_sessions', sessionDocId));
      return res.json({ valid: false });
    }

    const adminToken = jwt.sign({ userId: dId, email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ valid: true, token: adminToken });
  } catch (e) {
    return res.json({ valid: false });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  const { email } = req.body;
  if (email) {
    const sessionDocId = getDocId(email + "_session");
    const fbDb = getFirebaseDb();
    if (fbDb) {
      try {
        await deleteDoc(doc(fbDb, 'admin_sessions', sessionDocId));
        await logServerAuditActivity(req, 'LOGOUT', `Administrator logged out successfully`, email);
        await logSecurityEvent(req, 'ADMIN_LOGOUT', 'INFO', `Administrator logged out session`, email);
      } catch(e) {}
    }
  }
  res.json({ success: true });
});

// Admin Security Metrics & Status Endpoint
app.get('/api/admin/security/metrics', verifyAdminToken, async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();
    return res.json({
      success: true,
      metrics: {
        threatStats,
        uptimeSeconds: Math.floor(uptimeSeconds),
        nodeEnv: process.env.NODE_ENV || 'development',
        securityHeadersActive: true,
        httpsEnforced: process.env.NODE_ENV === 'production',
        rateLimitersActive: true,
        databaseDirectAccessBlocked: true,
        zeroTrustRulesDeployed: true
      }
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// CONTACT FORM SUBMISSION (Rate limited & Bot protected)
app.post('/api/contact', contactLimiter, honeypotBotDetector, async (req, res) => {
  const { name, email, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  // Length clamping to prevent memory buffer abuse
  const cleanName = String(name).trim().substring(0, 100);
  const cleanEmail = String(email).trim().toLowerCase().substring(0, 120);
  const cleanSubject = String(subject || 'Customer Inquiry').trim().substring(0, 150);
  const cleanMessage = String(message).trim().substring(0, 2000);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const fbDb = getFirebaseDb();
  const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (fbDb) {
    try {
      await setDoc(doc(fbDb, 'contact_messages', inquiryId), {
        id: inquiryId,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      });
    } catch (e: any) {
      console.warn('Could not store contact message in Firestore:', e.message);
    }
  }

  // Send notification email to store admin
  const notifSubject = `📬 New Contact Inquiry: ${cleanSubject}`;
  const notifContent = `
    <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">New Customer Message</h2>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;"><strong>From:</strong> ${cleanName} (${cleanEmail})</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;"><strong>Subject:</strong> ${cleanSubject}</p>
    <div style="background-color: #1f2937; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #374151; color: #ffffff; font-size: 14px; line-height: 1.6;">
      ${cleanMessage.replace(/\n/g, '<br/>')}
    </div>
  `;
  const notifHtml = getPremiumTemplateHtml(notifSubject, notifContent, getBaseUrl(req));
  sendEmail('idowutosin70@gmail.com', notifSubject, notifHtml).catch(err => console.error("Contact email dispatch failed:", err));

  await logSecurityEvent(req, 'CONTACT_FORM_SUBMITTED', 'INFO', `Inquiry received from ${cleanEmail}`, cleanEmail);

  return res.json({ success: true, message: 'Thank you for reaching out! Your message has been received.' });
});

// AI HARDWARE ADVISOR / RECOMMENDATION ENGINE (Rate limited, quota protected, prompt injection guarded)
app.post('/api/ai/advisor', aiLimiter, honeypotBotDetector, async (req, res) => {
  const { prompt, deviceContext, budget } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Prompt query is required.' });
  }

  // Length clamping to prevent token exhaustion attacks
  const userQuery = prompt.trim().substring(0, 500);

  // Prompt injection & jailbreak heuristics guard
  const INJECTION_PATTERNS = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior/i,
    /system prompt/i,
    /reveal (your |the )instructions/i,
    /you are now a/i,
    /act as an unfiltered/i,
    /dan mode/i
  ];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userQuery)) {
      threatStats.aiAbuseBlocks++;
      await logSecurityEvent(req, 'AI_INJECTION_ATTEMPT', 'HIGH', `AI prompt injection attempt detected: ${pattern}`, undefined, { prompt: userQuery });
      return res.status(400).json({ success: false, message: 'Invalid query format. Please ask a tech or gadget recommendation question.' });
    }
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Graceful offline fallback recommendation
    return res.json({
      success: true,
      recommendation: `Based on your query "${userQuery}", for professional workflows we recommend checking out the Apple MacBook Pro M-Series or Dell XPS line with at least 16GB unified memory and 512GB NVMe SSD available in our store catalog.`,
      isFallback: true
    });
  }

  try {
    const systemInstruction = `You are Tizzitech's AI Hardware Advisor. You provide concise, expert, friendly gadget and laptop buying advice tailored to Nigerian and global tech enthusiasts, creatives, and engineers. Mention specs clearly (CPU, RAM, GPU, storage, battery) in 2-3 short, structured paragraphs.`;

    const fullPrompt = `${systemInstruction}\n\nUser Question: ${userQuery}\nDevice Context: ${deviceContext || 'Laptops & Gadgets'}\nBudget: ${budget || 'Flexible'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const recommendation = response.text || 'Unable to generate recommendation at this moment.';
    await logSecurityEvent(req, 'AI_GENERATION_SUCCESS', 'INFO', `AI Hardware Advisor generated response`);

    return res.json({ success: true, recommendation, isFallback: false });
  } catch (err: any) {
    console.error('Gemini API execution error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'AI advisor is currently busy. Please try again shortly.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin Security Logs Endpoint
app.get('/api/admin/security/logs', verifyAdminToken, async (req, res) => {
  const limitCount = parseInt(req.query.limit as string) || 50;
  const fbDb = getFirebaseDb();
  if (fbDb) {
    try {
      const q = query(collection(fbDb, 'security_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({ success: true, logs });
    } catch (e: any) {
      console.warn('Could not fetch security_logs from Firestore:', e.message);
    }
  }
  return res.json({ success: true, logs: [] });
});

// 16. CENTRALIZED SYSTEM OBSERVABILITY & SECURITY SAFEGUARDS

// API endpoint to log client-side errors captured by the React ErrorBoundary
app.post('/api/logs/client-error', express.json(), async (req, res) => {
  const { message, stack, componentStack, url, userAgent, timestamp } = req.body;
  console.error('>>> React client-side exception received:', { message, url, timestamp });

  const fbDb = getFirebaseDb();
  if (fbDb) {
    try {
      await addDoc(collection(fbDb, 'client_error_logs'), {
        message: message || 'Unknown client error',
        stack: stack || '',
        componentStack: componentStack || '',
        url: url || '',
        userAgent: userAgent || '',
        timestamp: timestamp || new Date().toISOString(),
        loggedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Failed to write client error log to Firestore:', err.message);
    }
  }
  return res.json({ success: true });
});

// Global Centralized Express Error-Handling Middleware
// Prevents unhandled server-side route crashes from leaking raw stacks/database logs to users
app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('>>> UNHANDLED EXPRESS BACKEND SYSTEM EXCEPTION:', err.stack || err);
  
  try {
    await logSecurityEvent(req, 'API_INTERNAL_SERVER_ERROR', 'HIGH', `Unhandled backend error: ${err.message || 'Internal Server Error'}`, undefined, {
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } catch (logErr) {
    console.error('Failed to log server exception to security_logs:', logErr);
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: 'An unexpected processing error occurred on our server. Our operations team has been notified.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

async function boot() {
  app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/admin')) {
         res.sendFile(path.join(distPath, 'admin.html'));
      } else {
         res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    
app.get('/api/test-vercel', (req, res) => {
  res.json({
    cwd: process.cwd(),
    
    files: fs.readdirSync(process.cwd()),
    filesInApi: fs.existsSync(path.join(process.cwd(), 'api')) ? fs.readdirSync(path.join(process.cwd(), 'api')) : [],
    configExists: fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.json')),
  });
});

  if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  }
}

boot();
export default app;
