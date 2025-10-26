import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const generateAndHashToken = async () => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, 10);
  const resetId  = crypto.randomBytes(4).toString('hex');

  return { token, tokenHash, resetId };
};

