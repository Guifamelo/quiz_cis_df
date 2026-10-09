import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'questions.json'), 'utf8')).questions;
const bankIds = new Set(bank.map((q) => q.id));

console.log('=== Validação dos modos de quiz ===\n');
console.log('Quiz Completo:', bank.length, 'questões,', bankIds.size, 'IDs únicos');

if (bank.length !== bankIds.size) {
  console.error('FALHA: banco principal com IDs duplicados');
  process.exit(1);
}

const configs = ['quiz-30', 'quiz-40', 'quiz-50', 'quiz-75'];
const allPartialIds = new Set();

for (const id of configs) {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'src/data/quizzes', id + '.json'), 'utf8'));
  const unique = new Set(cfg.questionIds);
  const missing = cfg.questionIds.filter((qid) => !bankIds.has(qid));
  const expected = Number(id.split('-')[1]);

  console.log(`\n${cfg.title}:`);
  console.log('  IDs:', cfg.questionIds.length, '| únicos:', unique.size, '| esperado:', expected);
  if (cfg.questionIds.length !== expected) console.error('  FALHA: contagem errada');
  if (unique.size !== cfg.questionIds.length) console.error('  FALHA: IDs duplicados');
  if (missing.length) console.error('  FALHA: IDs inexistentes', missing);

  cfg.questionIds.forEach((qid) => allPartialIds.add(qid));
}

console.log('\n=== Simulação de ordem aleatória (2 tentativas quiz-30) ===');
const cfg30 = JSON.parse(fs.readFileSync(path.join(root, 'src/data/quizzes/quiz-30.json'), 'utf8'));
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const run1 = shuffle(cfg30.questionIds);
const run2 = shuffle(cfg30.questionIds);
const sameSet = run1.slice().sort().join() === cfg30.questionIds.slice().sort().join();
const sameOrder = run1.join() === run2.join();
console.log('  Mesmo conjunto de IDs:', sameSet);
console.log('  Ordem diferente entre tentativas:', !sameOrder);

console.log('\nOK — validação concluída.');
