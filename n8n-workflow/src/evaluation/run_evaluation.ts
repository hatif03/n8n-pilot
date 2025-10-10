import { AgentEvaluator } from '@iqai/adk';
import { getOrchestratorAgent } from '../agents/orchestrator';
import { logger } from '../utils/logger';
import * as path from 'path';

/**
 * ADK-TS Compliant Evaluation Runner
 * 
 * This script runs evaluation tests on the n8n Workflow Intelligence Platform
 * using ADK-TS evaluation framework.
 */
async function runEvaluation() {
  try {
    logger.info('Starting evaluation of n8n Workflow Intelligence Platform');
    console.log('🧪 Starting evaluation...');

    // Get the orchestrator agent
    const orchestrator = await getOrchestratorAgent();
    
    // Get the evaluation directory path
    const evaluationDir = path.join(__dirname, 'tests');
    
    console.log(`📁 Evaluation directory: ${evaluationDir}`);
    
    // Run evaluation using ADK-TS AgentEvaluator
    const results = await AgentEvaluator.evaluate(orchestrator, evaluationDir);
    
    console.log('📊 Evaluation Results:');
    console.log('====================');
    
    // Display results
    if (results.summary) {
      console.log(`✅ Total Tests: ${results.summary.totalTests}`);
      console.log(`✅ Passed: ${results.summary.passed}`);
      console.log(`❌ Failed: ${results.summary.failed}`);
      console.log(`📈 Success Rate: ${results.summary.successRate}%`);
      
      if (results.summary.averageScores) {
        console.log('\n📊 Average Scores:');
        Object.entries(results.summary.averageScores).forEach(([metric, score]) => {
          console.log(`  ${metric}: ${score.toFixed(3)}`);
        });
      }
    }
    
    // Display detailed results for each test case
    if (results.detailedResults) {
      console.log('\n📋 Detailed Results:');
      console.log('===================');
      
      results.detailedResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.evalId}`);
        console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Score: ${result.score?.toFixed(3) || 'N/A'}`);
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        
        if (result.metrics) {
          console.log('   Metrics:');
          Object.entries(result.metrics).forEach(([metric, value]) => {
            console.log(`     ${metric}: ${value}`);
          });
        }
      });
    }
    
    // Save results to file
    const resultsPath = path.join(__dirname, 'evaluation_results.json');
    const fs = await import('fs/promises');
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    logger.info('Evaluation completed successfully');
    console.log('✅ Evaluation completed!');
    
    return results;
    
  } catch (error) {
    logger.error('Evaluation failed:', error);
    console.error('❌ Evaluation failed:', error);
    throw error;
  }
}

// Run evaluation if this file is executed directly
if (require.main === module) {
  runEvaluation().catch(console.error);
}

export { runEvaluation };
