// Let's modify the agency dashboard routes in `routes/dashboard.js`
const fs = require('fs');

async function fix() {
  let content = fs.readFileSync('routes/dashboard.js', 'utf8');
  
  // Replace get packages
  content = content.replace(
    /router\.get\('\/agency\/packages', authenticateToken, requireAgency, async \(req, res\) => \{\n  try \{\n    const supabase = getSupabase\(\);\n    const \{ data: packages, error \} = await supabase\n      \.from\('packages'\)\n      \.select\('\*'\)\n      \.eq\('agency_id', req\.user\.id\)/,
    "router.get('/agency/packages', authenticateToken, requireAgency, async (req, res) => {\n  try {\n    const supabase = getSupabase();\n    const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', req.user.id).single();\n    const { data: packages, error } = await supabase\n      .from('packages')\n      .select('*')\n      .eq('agency_id', agency ? agency.id : req.user.id)"
  );

  // Replace post packages
  content = content.replace(
    /router\.post\('\/agency\/packages', authenticateToken, requireAgency, async \(req, res\) => \{\n  try \{\n    const \{ name, description, destination, duration_days, price, max_travelers, features \} = req\.body;\n    const supabase = getSupabase\(\);\n\n    const \{ data: newPackage, error \} = await supabase\n      \.from\('packages'\)\n      \.insert\(\{\n        agency_id: req\.user\.id,/,
    "router.post('/agency/packages', authenticateToken, requireAgency, async (req, res) => {\n  try {\n    const { name, description, destination, duration_days, price, max_travelers, features } = req.body;\n    const supabase = getSupabase();\n    const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', req.user.id).single();\n\n    const { data: newPackage, error } = await supabase\n      .from('packages')\n      .insert({\n        agency_id: agency ? agency.id : req.user.id,"
  );

  // Replace agency bookings
  content = content.replace(
    /\.eq\('packages\.agency_id', req\.user\.id\)/,
    ".eq('packages.agency_id', (await supabase.from('agencies').select('id').eq('user_id', req.user.id).single()).data?.id || req.user.id)"
  );

  fs.writeFileSync('routes/dashboard.js', content, 'utf8');
}
fix();
