import dotenv from 'dotenv';
dotenv.config();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY);
console.log('MLABS_AUTH_URL:', process.env.MLABS_AUTH_URL); 