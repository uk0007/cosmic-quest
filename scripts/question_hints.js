/* Hints guide reasoning; explanations and option labels are never hint fallbacks. */
(function(root){
  const rules=[
    [/collective noun/i,'Think of the special word used for a group of this kind of animal or thing.'],
    [/relative pronoun/i,'Check whether the blank refers to a person or a thing, and whether it does the action or receives it.'],
    [/degree of adjective|superlative|comparative/i,'Count how many things are being compared: two, or a whole group.'],
    [/synonym|same meaning/i,'Put each word into a simple sentence and look for the one that keeps its meaning.'],
    [/antonym|opposite/i,'Think about the opposite idea, rather than a related word.'],
    [/tense|past|verb/i,'Look for time clues and check whether the action has finished or is still happening.'],
    [/preposition/i,'Picture the position, direction or time relationship described in the sentence.'],
    [/article|\ba, an|\ban or/i,'Listen to the first sound of the following word, not just its first letter.'],
    [/plural/i,'Check whether the word follows the usual ending rule or changes in a special way.'],
    [/spelling|correctly spelt/i,'Break the word into syllables and check each part carefully.'],
    [/odd one|different from/i,'Find a property shared by three items, then look for the item that does not share it.'],
    [/pattern|series|sequence/i,'Compare each pair of neighbours. Look for a repeating change, then apply it once more.'],
    [/coded|code for/i,'Compare the example one character at a time and reuse the same change.'],
    [/fraction|percentage/i,'Work out the size of one equal part before calculating the requested amount.'],
    [/perimeter/i,'Trace the outside boundary and include every side exactly once.'],
    [/area/i,'Think about how many unit squares would cover the inside of the shape.'],
    [/plant|leaf|leaves|photosynthesis/i,'Think about what each plant part does and how that function helps it survive.'],
    [/bird|animal|insect/i,'Compare how these animals move, feed and adapt to their habitats.'],
    [/organ|body|blood/i,'Think about the job being described and which body part carries it out.'],
    [/planet|solar|moon|sun|star/i,'Compare the objects by their position, movement and whether they produce their own light.'],
    [/electric|circuit/i,'Trace the complete path and consider what lets the current flow.'],
    [/force|friction|gravity/i,'Imagine the motion before and after the interaction. What makes it change?'],
    [/evapor|condens|water|solid|liquid|gas/i,'Think about whether heat is being added or removed and how particles move.'],
    [/capital|country|continent|river|ocean/i,'Recall the location and nearby landmarks before choosing.'],
    [/invent|discover|history|year|first/i,'Connect the event to its purpose and place in the timeline.']
  ];
  function reveals(q,text){
    if(/(?:option|answer|choice)\s*(?:is|number|letter|:)?\s*[\(\[]?[a-d1-4]\b|correct answer|focus on option/i.test(text))return true;
    const answer=String((q.options||[])[q.answerIndex]||'').trim().toLowerCase();
    const words=String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
    const target=answer.match(/[\p{L}\p{N}]+/gu)||[];
    return target.length>0 && words.join(' ').includes(target.join(' '));
  }
  root.getQuestionHint=function(q={}){
    const saved=typeof q.hint==='string'?q.hint.trim():'';
    if(saved&&!reveals(q,saved)&&!/<[^>]*>/.test(saved))return saved;
    const clue=rules.find(([pattern])=>pattern.test(q.question||''))?.[1];
    if(clue&&!reveals(q,clue))return clue;
    return 'Break the task into smaller steps. Recall the relevant rule or fact, then compare each possibility with it.';
  };
})(typeof window!=='undefined'?window:globalThis);
