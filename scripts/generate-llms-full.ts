process.env.LLMS_OUTPUT_FILE = 'uxcore_/llms-full.txt';
// Large enough to include all current UXCore (105) and UXCG entries.
process.env.LLMS_DYNAMIC_LIMIT = '1000';
process.env.LLMS_WRITE_SLUG_MDS = 'true';
process.env.LLMS_SLUG_MD_DIR = 'uxcore_/llms-full-pages';

void import('./generate-llms');
