import Tokenizer from './Tokenizer';
import chalk from 'chalk';

const source = '{a in R | a > 0, a < 10}'
const tokenizer = new Tokenizer(source)
console.log(chalk.green(source))
for (let i = 0; i < 13; i++) {
    console.log(tokenizer.nextToken().toString())
}