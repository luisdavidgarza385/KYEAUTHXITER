const bcrypt = require("bcryptjs");
const hash = "$2a$10$zj28qKrEsdxLxbGHJD/x7eG5TILLKzngX1IGInuMCxMDZb1N8fu16";

async function run() {
  const matches = await bcrypt.compare("SpectralX", hash);
  console.log("Matches SpectralX:", matches);
}
run().catch(console.error);
