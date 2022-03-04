import Tokenizer from './Tokenizer';
import chalk from 'chalk';
import Parser from './Parser';

const source = 'def field\n' +
    '    where\n' +
    '        F: set,\n' +
    '        +: F prod F -> F,\n' +
    '        *: F prod F -> F\n' +
    '    forall a, b, c in F,\n' +
    '        (a + b) + c = a + (b + c),\n' +
    '        a + b = b + a,\n' +
    '        exists 0 in F forall a in F    a + 0 = 0 + a = a,\n' +
    '        exists -a in F     -a + a = -a + a = 0,\n' +
    '        (a * b) * c = a * (b * c),\n' +
    '        a * b = b * a,\n' +
    '        exists 1 in F forall a in F     1 * a = a * 1 = 1,\n' +
    '        forall a in F \\ {0} exists a^-1    a * a^-1 = a^-1 * a = 1,\n' +
    '        a * (b + c) = a * b + a * c'
const tokenizer = new Tokenizer(source)
console.log(chalk.green(source))
const parser = new Parser(tokenizer)
parser.parse()