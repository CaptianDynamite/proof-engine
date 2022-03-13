import Tokenizer from './Tokenizer';
import chalk from 'chalk';
import Parser from './Parser';

const source = 'def type[field] {\n' +
    '    forall F type[set](F)\n' +
    '    forall + type[F prod F => F](+)\n' +
    '    forall * type[F prod F => F](*)\n' +
    '    forall a in(F, a) forall b in(F, b) forall c in(F, c)\n' +
    '        +(+(a, b), c) = +(a, +(b, c))\n' +
    '        and +(a, b) = +(b, a)\n' +
    '        and exists 0 in(F, 0) forall a in(F, a) +(a, 0) = +(0, a) = a\n' +
    '        and exists -a in(F, -a) +(-a, a) = +(a, -a) = 0\n' +
    '        and *( *(a, b), c) = *(a, *(b, c))\n' +
    '        and *(a, b) = *(b, a)\n' +
    '        and exists 1 in(F, 1) forall a in(F, a) *(1, a) = *(a, 1) = 1\n' +
    '        and forall a in(\\(F, {0}), a) exists a^-1 in(\\(F, {0}), a^-1) *(a, a^-1) = *(a^-1, a) = 1\n' +
    '        and *(a, +(b, c)) = +(*(a, b), *(a, c))\n' +
    '        <=> type[field]((F, +, *))\n' +
    '}'
const tokenizer = new Tokenizer(source)
console.log(chalk.green(source))
const parser = new Parser(tokenizer)
parser.parse()