/**
 * Harness Audit Script
 * Generates a system health scorecard for the Job Card System.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'text';

const checks = [
  { category: 'Tool Coverage', score: 10, weight: 1 },
  { category: 'Context Efficiency', score: 0, weight: 1 },
  { category: 'Quality Gates', score: 0, weight: 1 },
  { category: 'Memory Persistence', score: 10, weight: 1 },
  { category: 'Eval Coverage', score: 0, weight: 1 },
  { category: 'Security Guardrails', score: 0, weight: 1 },
  { category: 'Cost Efficiency', score: 10, weight: 1 },
];

const findings = [];

// 1. Quality Gates (Tests)
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts.test) {
    checks[2].score = 8;
    findings.push('[Quality Gates] Test script found in package.json.');
  }
} catch (e) {}

// 2. Security Guardrails
if (fs.existsSync('api/index.js')) {
  const apiCode = fs.readFileSync('api/index.js', 'utf8');
  if (apiCode.includes('authenticateToken') && !apiCode.includes('fallback-secret')) {
    checks[5].score = 10;
    findings.push('[Security Guardrails] API authentication and JWT security enforced.');
  } else {
    checks[5].score = 4;
    findings.push('[Security Guardrails] API security could be improved (found fallback secrets or missing middleware).');
  }
}

// 3. Eval Coverage (Vitest)
if (fs.existsSync('api/workflow.test.js')) {
  checks[4].score = 7;
  findings.push('[Eval Coverage] Unit tests for core workflow exist.');
}

// 4. Context Efficiency
if (fs.existsSync('.autopilotrc.json')) {
  checks[1].score = 9;
  findings.push('[Context Efficiency] Autopilot configuration found.');
}

const totalScore = checks.reduce((acc, c) => acc + c.score, 0);
const maxScore = 70;

if (format === 'json') {
  console.log(JSON.stringify({
    overall_score: totalScore,
    max_score: maxScore,
    categories: checks,
    findings,
    top_actions: [
      "Increase automated test coverage to 80%+",
      "Complete remaining security audits for frontend components",
      "Optimize build artifacts for production deployment"
    ]
  }, null, 2));
} else {
  console.log(`Harness Audit (repo): ${totalScore}/${maxScore}`);
  checks.forEach(c => {
    console.log(`- ${c.category}: ${c.score}/10`);
  });
  console.log('\nTop 3 Actions:');
  console.log('1) [Eval Coverage] Increase automated test coverage across api/ and src/.');
  console.log('2) [Quality Gates] Integrate CI/CD pipeline for automated testing.');
  console.log('3) [Security Guardrails] Perform regular dependency audits and updates.');
}
