const isAlphabetical = (char: string): boolean => {
    if (char.length !== 1) throw new Error('Argument "char" must have a length of 1');
    const lowerCaseCodePoint = char.charCodeAt(0) | 32
    return 97 <= lowerCaseCodePoint && lowerCaseCodePoint <= 122
}
const isNumerical = (char: string): boolean => {
    if (char.length !== 1) throw new Error('Argument "char" must have a length of 1')
    const codePoint = char.charCodeAt(0)
    return 48 <= codePoint && codePoint <= 57
}

class Tokenizer {

    private readonly source: string
    private stringIndex: number
    private peekIndex: number

    constructor(source: string) {
        this.source = source.trim()
        this.stringIndex = 0
        this.peekIndex = 0
    }

    nextToken(): Token {
        let result = this.parseSingleChar()
        if (result !== undefined) return result
        result = this.parseVariable()
        if (result !== undefined) return result
        result = this.parseInteger()
        if (result !== undefined) return result
        throw Error(`Error lexing at ${this.stringIndex}`)
    }

    parseSingleChar(): (Token | undefined) {
        const char = this.peekChar()
        switch(char) {
            case '{': return this.tokenFound(TokenType.LeftBrace)
            case '}': return this.tokenFound(TokenType.RightBrace)
            case '(': return this.tokenFound(TokenType.LeftBracket)
            case ')': return this.tokenFound(TokenType.RightBracket)
            case '^': return this.tokenFound(TokenType.Exponent)
            case '*': return this.tokenFound(TokenType.Multiply)
            case '/': return this.tokenFound(TokenType.Divide)
            case '+': return this.tokenFound(TokenType.Add)
            case '-': return this.tokenFound(TokenType.Subtract)
            case ',': return this.tokenFound(TokenType.Comma)
            default: return this.tokenNotFound()
        }
    }

    parseVariable(): (Token | undefined) {
        let length = 0
        while (isAlphabetical(this.peekChar())) length++
        // This has to be done since the above line includes the non-matching
        // character in the peeked token
        this.unpeekChar()
        if (length > 0) return this.tokenFound(TokenType.Variable)
        else return this.tokenNotFound()
    }

    parseInteger(): (Token | undefined) {
        let length = 0
        while (isNumerical(this.peekChar())) length++
        // This has to be done since the above line includes the non-matching
        // character in the peeked token
        this.unpeekChar()
        if (length > 0) return this.tokenFound(TokenType.Natural)
        else return this.tokenNotFound()
    }

    peekChar(): string {
        return this.source.charAt(this.peekIndex++)
    }

    unpeekChar() {
        this.peekIndex--
    }

    tokenFound(type: TokenType): Token {
        const index = this.stringIndex;
        const length = this.peekIndex - this.stringIndex
        const sourceString = this.source.substring(this.stringIndex, this.peekIndex)
        this.stringIndex = this.peekIndex
        return new Token(type, sourceString, index, length)
    }

    tokenNotFound(): undefined {
        this.peekIndex = this.stringIndex
        return undefined
    }

}

class Token {

    constructor(
        readonly type: TokenType,
        readonly tokenString: string,
        readonly index: number,
        readonly length: number
    ) {}

    public toString(): string {
        return `${TokenType[this.type]}: "${this.tokenString}" @${this.index} len=${this.length}"`
    }

}

enum TokenType {
    LeftBrace, RightBrace,
    LeftBracket, RightBracket,
    Exponent,
    Multiply, Divide,
    Add, Subtract,
    Variable, Natural,
    Comma
}

let tokens = new Tokenizer('(abcd+1234)')
console.log('(abcd+1234)')
for (let i = 0; i < 5; i++) console.log(tokens.nextToken().toString())
console.log("--------------------------------------")
tokens = new Tokenizer('{a,b,1,23232,(a+b-12)^(123^21))}')
console.log('{a,b,1,23232,(a+b-12)^(123^21))}')
for (let i = 0; i < 24; i++) console.log(tokens.nextToken().toString())
