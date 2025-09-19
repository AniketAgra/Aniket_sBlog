import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';

// Load env from api/.env first, then project root .env
dotenv.config();
if (!process.env.MONGO_URL) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: rootEnvPath });
}

const args = process.argv.slice(2);
const parseArg = (key) => {
  const prefix = `--${key}=`;
  const item = args.find((a) => a.startsWith(prefix));
  return item ? item.substring(prefix.length) : undefined;
};

const email = parseArg('email');
const id = parseArg('id');
const role = parseArg('role') || 'admin'; // default promote to admin

if (!email && !id) {
  console.error('Usage: node api/scripts/promoteUser.js --email=user@example.com [--role=admin|user]');
  console.error('   or: node api/scripts/promoteUser.js --id=<mongoId> [--role=admin|user]');
  process.exit(1);
}

if (!['admin', 'user'].includes(role)) {
  console.error("Invalid role. Allowed values: 'admin' | 'user'");
  process.exit(1);
}

if (!process.env.MONGO_URL) {
  console.error('Missing MONGO_URL in environment. Create .env with MONGO_URL and JWT_SECRET.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const filter = email ? { email: email.toLowerCase() } : { _id: id };

    const user = await User.findOne(filter);
    
    if (!user) {
      console.error('User not found:', email || id);
      process.exitCode = 1;
      return;
    }

    if (user.role === role) {
      console.log(`No change needed. User ${user.email} already has role='${role}'.`);
      return;
    }

    user.role = role;
    await user.save();

    console.log(`Success: Updated ${user.email} (${user._id}) to role='${role}'.`);
  } catch (err) {
    console.error('Error updating user role:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
