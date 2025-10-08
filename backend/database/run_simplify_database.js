#!/usr/bin/env node

/**
 * Simplify Database Structure Script
 * This script simplifies the database by:
 * - Deleting agencies and package_approval_history tables
 * - Modifying packages table to reference agency_approval_history directly
 */

const fs = require('fs');
const path = require('path');

// Read the simplify database SQL file
const sqlFilePath = path.join(__dirname, 'simplify_database_structure.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🗂️ Simplify Database Structure Script');
console.log('=====================================');
console.log('');
console.log('This script simplifies your database structure:');
console.log('');
console.log('❌ Tables to DELETE:');
console.log('   • agencies table');
console.log('   • package_approval_history table');
console.log('');
console.log('✅ Tables to KEEP:');
console.log('   • agency_approval_history table (contains your agency data)');
console.log('   • packages table (modified to reference agency_approval_history)');
console.log('');
console.log('🔧 Changes made:');
console.log('   • packages.agency_id now references agency_approval_history.agency_id');
console.log('   • RLS policies updated for the new structure');
console.log('   • Foreign key constraints properly configured');
console.log('');
console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
console.log('');
console.log('📝 Copy and paste the following SQL:');
console.log('');
console.log('─'.repeat(80));
console.log(sqlContent);
console.log('─'.repeat(80));
console.log('');
console.log('✅ After running this SQL, your database will have:');
console.log('');
console.log('📊 Simplified Structure:');
console.log('   • agency_approval_history table (your agency data)');
console.log('   • packages table (references agency_approval_history)');
console.log('   • No redundant tables');
console.log('');
console.log('🔐 Security & Permissions:');
console.log('   • RLS policies for packages table');
console.log('   • RLS policies for agency_approval_history table');
console.log('   • Proper permissions granted');
console.log('');
console.log('🎯 Result:');
console.log('   • Cleaner database structure');
console.log('   • No foreign key constraint violations');
console.log('   • Packages can be created successfully');
console.log('   • Agency data properly linked');
console.log('');
console.log('🚀 Run the SQL and your database will be simplified and working perfectly!');






