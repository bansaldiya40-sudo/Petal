async function regeneratePm2() {
  console.log('Triggering real AI regeneration for mat-1793548739808-dojlom...');
  const start = Date.now();
  const res = await fetch('http://localhost:3001/api/materials/mat-1793548739808-dojlom/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab: 'all' })
  });
  console.log('Status:', res.status, `in ${(Date.now() - start)/1000}s`);
  const data = await res.json();
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }
  console.log('Success! Material title:', data.title);
  console.log('Sections generated:', data.sections?.length);
  data.sections?.forEach((sec, idx) => {
    console.log(`\n=== Section ${idx + 1}: ${sec.slidesRange} - ${sec.title} ===`);
    console.log('Status:', sec.status);
    console.log('In Simple Words (length: ' + sec.inSimpleWords?.split(/\s+/).length + ' words):');
    console.log(sec.inSimpleWords?.slice(0, 180) + '...');
    console.log('Analogy:', sec.analogy?.slice(0, 120) + '...');
    console.log('Examples count:', sec.examples?.length);
    console.log('Key terms count:', sec.keyTerms?.length);
    console.log('PM Takeaway:', sec.pmTakeaway?.slice(0, 120) + '...');
    console.log('Formulas count:', sec.formulas?.length || 0);
    console.log('Common Mistakes count:', sec.commonMistakes?.length || 0);
  });
}
regeneratePm2();
