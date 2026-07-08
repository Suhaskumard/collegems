// index.js or server.js

import dotenv from "dotenv";
import { initializeApp } from "./src/bootstrap/index.js";
import compression from "compression";

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : process.env.NODE_ENV === 'staging' 
        ? '.env.staging' 
        : '.env';

dotenv.config({ 
    path: envFile,
    debug: process.env.NODE_ENV === 'development'
});

// Validate required environment variables
const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    // Add other required env vars
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    
    if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Exit in production
    }
}

// ============================================
// CONFIGURATION
// ============================================

const config = {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isStaging: process.env.NODE_ENV === 'staging',
    
    // Compression settings
    compression: {
        enabled: process.env.COMPRESSION_ENABLED !== 'false',
        level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
        threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
        memLevel: parseInt(process.env.COMPRESSION_MEM_LEVEL) || 8,
        chunkSize: parseInt(process.env.COMPRESSION_CHUNK_SIZE) || 16384,
        filter: (req, res) => {
            // Skip compression for specific requests
            if (req.path === '/health' || req.path === '/ping') {
                return false;
            }
            
            // Skip compression for small responses
            if (res.getHeader('content-length') && 
                parseInt(res.getHeader('content-length')) < 1024) {
                return false;
            }
            
            // Default filter
            return compression.filter(req, res);
        }
    },
    
    // CORS settings
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Pagination-Total'],
        maxAge: 86400 // 24 hours
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        message: 'Too many requests from this IP, please try again later.'
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
        silent: process.env.NODE_ENV === 'test'
    },
    
    // Security
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        },
        session: {
            secret: process.env.SESSION_SECRET || 'default-secret-change-me',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax'
            }
        }
    }
};

// ============================================
// LOGGER
// ============================================

const logger = {
    info: (message, data = {}) => {
        if (config.logging.level === 'silent') return;
        console.log(`[INFO] ${message}`, data);
    },
    error: (message, error = null) => {
        console.error(`[ERROR] ${message}`, error);
    },
    warn: (message, data = {}) => {
        if (config.logging.level === 'silent') return;
        console.warn(`[WARN] ${message}`, data);
    },
    debug: (message, data = {}) => {
        if (config.logging.level !== 'debug') return;
        console.debug(`[DEBUG] ${message}`, data);
    },
    start: (port) => {
        console.log('\n🚀 Server started successfully!');
        console.log(`📡 Running on: http://localhost:${port}`);
        console.log(`🌍 Environment: ${config.env}`);
        console.log(`📦 Compression: ${config.compression.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`🛡️  Security: ${config.isProduction ? '🔒 Production' : '🔓 Development'}`);
        console.log('='.repeat(50));
    },
    shutdown: (signal) => {
        console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);
    }
};

// ============================================
// GRACEFUL SHUTDOWN HANDLERS
// ============================================

const handleShutdown = (signal) => {
    logger.shutdown(signal);
    
    // In production, close database connections, etc.
    // await db.close();
    // await redis.quit();
    
    process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    if (config.isProduction) {
        process.exit(1);
    }
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { reason, promise });
    if (config.isProduction) {
        process.exit(1);
    }
});

// ============================================
// SERVER INITIALIZATION
// ============================================

// Apply compression middleware BEFORE starting the app
if (config.compression.enabled) {
    logger.info('Compression middleware enabled', {
        level: config.compression.level,
        threshold: `${config.compression.threshold} bytes`
    });
}

/**
 * Start the application with error handling
 */
const startServer = async () => {
    try {
        // Initialize the application
        const app = await initializeApp(config);
        
        // Apply compression middleware
        if (config.compression.enabled) {
            app.use(compression({
                level: config.compression.level,
                threshold: config.compression.threshold,
                memLevel: config.compression.memLevel,
                chunkSize: config.compression.chunkSize,
                filter: config.compression.filter
            }));
        }
        
        // Start listening
        const server = app.listen(config.port, () => {
            logger.start(config.port);
        });
        
        // Store server instance for graceful shutdown
        global.__server = server;
        
        return { app, server };
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// ============================================
// HEALTH CHECK ENDPOINT (Optional)
// ============================================

// If you want to add health check endpoint
const addHealthCheck = (app) => {
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: config.env,
            compression: {
                enabled: config.compression.enabled,
                level: config.compression.level
            }
        });
    });
    
    app.get('/ping', (req, res) => {
        res.status(200).send('pong');
    });
};

// ============================================
// EXPORT
// ============================================

// Execute the centralized bootstrap sequence
startServer().catch(error => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});

export { config, logger, startServer };