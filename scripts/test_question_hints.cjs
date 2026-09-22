const assert=require('assert');const fs=require('fs');require('./question_hints.js');
const pattern={question:'Find the next number in the pattern: 5, 10, 15, 20?',options:['22','25','30','35'],answerIndex:1,hint:'Carefully consider option (B) - 25!',explanation:'The answer is 25.'};
assert(/neighbours/.test(getQuestionHint(pattern)));assert(!getQuestionHint(pattern).includes('25'));
assert(!getQuestionHint({...pattern,hint:''}).includes('25'));
assert.equal(getQuestionHint({...pattern,hint:'Compare the differences between neighbouring numbers.'}),'Compare the differences between neighbouring numbers.');
assert(!getQuestionHint({...pattern,hint:'The result is 25.'}).includes('25'));
assert(!getQuestionHint({...pattern,hint:'<b>25</b>'}).includes('<'));
for(const file of ['questions','iso_questions','ieo_questions']){
 const questions=JSON.parse(fs.readFileSync(`data/${file}.json`));
 for(const q of questions){const hint=getQuestionHint(q);assert(hint.length>10);assert(!/consider option|focus on option|option\s*\([A-D]\)/i.test(hint));}
 console.log(`${file}: ${questions.length} hints checked`);
}
