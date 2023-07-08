import nlp from 'compromise/three';

let doc = nlp('Wayne\'s World, party box time');
let str = doc.match('#Person').out('array');
console.log('hello, wolrd!', str);
