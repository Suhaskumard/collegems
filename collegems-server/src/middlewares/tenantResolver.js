import mongoose from 'mongoose';
import Tenant from '../models/Tenant.model.js';
import { tenantContext } from '../utils/asyncLocalStorage.js';

/**
 * Middleware to resolve the tenant from the request and attach it to the AsyncLocalStorage context.
 * It checks the 'x-tenant-id' header first, falling back to subdomain parsing if needed in the future.
 */
const tenantResolver = async (req, res, next) => {
  try {
    // Super-admin routes or webhooks can bypass tenant resolution by hitting specific base paths
    if (req.path.startsWith('/api/super-admin') || req.path.startsWith('/api/webhooks')) {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant Context Missing: x-tenant-id header is required for this request.',
      });
    }

    let tenant = null;

    // SAFETY CHECK: Is this a real 24-character MongoDB ID?
    if (mongoose.Types.ObjectId.isValid(tenantId)) {
      // If it is a real ID, look it up exactly
      tenant = await Tenant.findById(tenantId);
    } else {
      // LOCAL DEV FALLBACK: If it's just a word like "collegems", grab the first tenant in the DB
      tenant = await Tenant.findOne();
    }

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found. Make sure at least one tenant exists in your database!',
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This institution account is suspended or pending activation.',
      });
    }

    // Attach to request object (for legacy controller access)
    req.tenantId = tenant._id.toString();
    req.tenant = tenant;

    // Run the rest of the request within the AsyncLocalStorage context
    // This allows deep Mongoose plugins to access the tenantId without having req passed to them!
    tenantContext.run({ tenantId: req.tenantId }, () => {
      next();
    });

  } catch (error) {
    console.error('Tenant Resolver Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during tenant resolution.' });
  }
};

export default tenantResolver;