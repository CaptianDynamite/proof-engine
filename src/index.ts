import Tokenizer from './Tokenizer';
import chalk from 'chalk';
import Parser from './Parser';

const source = 'def type[field] {\n' +
    '    forall F type[set](F)\n' +
    '    and forall + type[F prod F => F](+)\n' +
    '    and forall * type[F prod F => F](*)\n' +
    '    and forall a in(F, a) and forall b in(F, b) and forall c in(F, c)\n' +
    '    and (\n' +
    '        +(+(a, b), c) = +(a, +(b, c))\n' +
    '        and +(a, b) = +(b, a)\n' +
    '        and exists 0 in(F, 0) and forall a in(F, a) and +(a, 0) = a and +(0, a) = a\n' +
    '        and exists -a in(F, -a) and +(-a, a) = 0 and +(a, -a) = 0\n' +
    '        and *( *(a, b), c) = *(a, *(b, c))\n' +
    '        and *(a, b) = *(b, a)\n' +
    '        and exists 1 in(F, 1) and forall a in(F, a) and *(1, a) = a and *(a, 1) = a\n' +
    '        and forall a in(\\(F, {0}), a) and exists a^-1 in(\\(F, {0}), a^-1) and *(a, a^-1) = 1 and *(a^-1, a) = 1\n' +
    '        and *(a, +(b, c)) = +(*(a, b), *(a, c))\n' +
    '        <=> type[field](F, +, *)\n' +
    '    )\n' +
    '}'
const tokenizer = new Tokenizer(source)
console.log(chalk.green(source))
const parser = new Parser(tokenizer)
parser.parse()