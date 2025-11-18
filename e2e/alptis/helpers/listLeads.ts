#!/usr/bin/env tsx
/**
 * Script to list all available leads with their characteristics
 */
import { loadAllLeads } from './loadLeads';
import { categorizeLeads } from './leadCategorization';

const leads = loadAllLeads();
const categorized = categorizeLeads(leads);

console.log('\n📋 LES 15 LEADS DISPONIBLES:\n');
console.log('='.repeat(80));

categorized.forEach((cat, i) => {
  const { metadata } = cat;
  console.log(`\n🔹 Lead #${i + 1} - ${metadata.subscriberName} (${metadata.civilite})`);
  console.log(`   Profession: ${metadata.profession}`);
  console.log(`   Régime: ${metadata.regimeType}`);

  const badges = [];
  if (metadata.hasConjoint) badges.push('👫 Conjoint');
  if (metadata.childrenCount > 0) badges.push(`👶 ${metadata.childrenCount} enfant(s)`);
  if (metadata.requiresCadreExercice) badges.push('💼 Cadre exercice');

  if (badges.length > 0) {
    console.log(`   Badges: ${badges.join(' | ')}`);
  }
});

console.log('\n' + '='.repeat(80));

const stats = categorized.reduce((acc, cat) => {
  if (cat.metadata.hasConjoint) acc.conjoint++;
  if (cat.metadata.childrenCount > 0) acc.enfants++;
  if (cat.metadata.hasConjoint && cat.metadata.childrenCount > 0) acc.both++;
  if (cat.metadata.requiresCadreExercice) acc.cadre++;
  if (cat.metadata.regimeType === 'TNS_INDEPENDANT') acc.tns++;
  return acc;
}, { conjoint: 0, enfants: 0, both: 0, cadre: 0, tns: 0 });

console.log(`\n📊 STATISTIQUES:`);
console.log(`   Total: ${categorized.length} leads`);
console.log(`   Avec conjoint: ${stats.conjoint}`);
console.log(`   Avec enfants: ${stats.enfants}`);
console.log(`   Conjoint + enfants: ${stats.both}`);
console.log(`   Avec cadre exercice: ${stats.cadre}`);
console.log(`   TNS/Indépendants: ${stats.tns}`);
console.log('');
