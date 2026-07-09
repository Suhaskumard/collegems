// collegems-server/src/config/helmetConfig.js

/**
 * Helmet Middleware Configuration
 * Security headers for Express applications
 */

const helmet = require('helmet');

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// HELMET CONFIGURATION
// ============================================

const helmetConfig = {
    // Content Security Policy (CSP)
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net",
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com",
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:",
                "blob:",
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com",
            ],
            connectSrc: [
                "'self'",
                "https://api.example.com",
                "ws://localhost:*",
                "wss://*.example.com",
            ],
            frameSrc: [
                "'self'",
                "https://www.youtube.com",
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: isProduction ? [] : null,
        },
        reportOnly: isDevelopment, // In dev, report only (don't block)
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: true,

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: {
        policy: isProduction ? 'same-origin' : 'unsafe-none',
    },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: {
        policy: isProduction ? 'same-origin' : 'cross-origin',
    },

    // DNS Prefetch Control
    dnsPrefetchControl: {
        allow: false,
    },

    // Expect-CT (Certificate Transparency)
    expectCt: {
        maxAge: 86400,
        enforce: true,
    },

    // Frameguard (X-Frame-Options)
    frameguard: {
        action: 'deny',
    },

    // Hide Powered-By (X-Powered-By)
    hidePoweredBy: true,

    // HSTS (Strict-Transport-Security)
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },

    // IE No Open (X-Download-Options)
    ieNoOpen: true,

    // No Sniff (X-Content-Type-Options)
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },

    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
    },

    // X-XSS-Protection
    xssFilter: true,
};

// ============================================
// CUSTOM HELMET MIDDLEWARE
// ============================================

/**
 * Custom Helmet middleware with environment-specific settings
 */
const customHelmet = () => {
    // Base helmet configuration
    let config = {
        ...helmetConfig,
    };

    // Development-specific settings
    if (isDevelopment) {
        console.log('🔓 Helmet running in development mode (report-only CSP)');
        // Allow more flexibility in development
        config.contentSecurityPolicy = {
            ...helmetConfig.contentSecurityPolicy,
            reportOnly: true,
        };
        config.hsts = {
            maxAge: 0, // Disable HSTS in development
        };
        config.crossOriginOpenerPolicy = {
            policy: 'unsafe-none',
        };
        config.crossOriginResourcePolicy = {
            policy: 'cross-origin',
        };
    }

    // Production-specific settings
    if (isProduction) {
        console.log('🔒 Helmet running in production mode (strict security)');
        // Strict security in production
        config.contentSecurityPolicy = {
            ...helmetConfig.contentSecurityPolicy,
            reportOnly: false,
        };
    }

    // Return configured helmet middleware
    return helmet(config);
};

// ============================================
// EXPORT
// ============================================

module.exports = {
    helmetConfig,
    customHelmet,
    isProduction,
    isDevelopment,
};