process.env.LLMS_OUTPUT_FILE = 'uxcore_/llms-full.txt';
// Large enough to include all current UXCore (105) and UXCG entries.
process.env.LLMS_DYNAMIC_LIMIT = '1000';

void import('./generate-llms');
