import Tokenizer, {TokenType} from './Tokenizer';
import chalk from 'chalk';

const source = 'def field:\n' +
    '    let F be a set\n' +
    '    let +: F prod F -> F\n' +
    '    let *: F prod F -> F\n' +
    '    such that forall a, b, c\n' +
    '    1) (a + b) + c = a + (a + b)\n' +
    '    2) a + b = b + a\n' +
    '    3) exists 0 in F such that forall a in F, a + 0 = 0 + a = a\n' +
    '    4) exists -a in F such that a + (-a) = (-a) + a = 0\n' +
    '    5) (a * b) * c = a * (b * c)\n' +
    '    6) a * b = b * a\n' +
    '    7) exists 1 in F such that forall a in F, 1 * a = a * 1 = a\n' +
    '    8) forall a in F \\ {0}, exists a^(-1) such that a * a^(-1) = a^(-1) * a = 1\n' +
    '    9) a * (b + c) = a * b + a * c'
const tokenizer = new Tokenizer(source)
console.log(chalk.green(source))
for (let next = tokenizer.nextToken(); next.type !== TokenType.End; next = tokenizer.nextToken()) {
    console.log(next.toString())
}