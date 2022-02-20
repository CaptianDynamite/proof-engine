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

enum TokenType {
    LeftBrace, RightBrace,
    VBar,
    Equals, LessThan, GreaterThan,
    NotEqual, GreaterThanEqual, LessThanEqual,
    LeftBracket, RightBracket,
    Exponent,
    Multiply, Divide,
    Add, Subtract,
    Variable, Natural,
    Comma,

    In, Subset, SubsetEq
}

class Tokenizer {

    private readonly source: string
    private stringIndex: number
    private peekIndex: number

    private static readonly multiChars: Map<string, TokenType> =
        new Map([
            ['in', TokenType.In],
            ['subset', TokenType.Subset],
            ['subseteq', TokenType.SubsetEq],
            ['!=', TokenType.NotEqual],
            ['>=', TokenType.GreaterThanEqual],
            ['<=', TokenType.LessThanEqual]
        ])
    private static readonly delimiters: string[] = [
        ' ', '\n'
    ]


    constructor(source: string) {
        this.source = source.trim()
        this.stringIndex = 0
        this.peekIndex = 0
    }

    nextToken(): Token {
        //We need to skip the whitespace at the current index if there is any
        this.skipWhiteSpace()
        let result = this.parseSingleChar()
        if (result !== undefined) return result
        result = this.parseVariable()
        if (result !== undefined) return result
        result = this.parseInteger()
        if (result !== undefined) return result
        result = this.parseMultiChar()
        if (result !== undefined) return result
        throw Error(`Error lexing at ${this.stringIndex}`)
    }

    skipWhiteSpace(): void {
        let next = this.peekChar()
        while(next === ' ' || next === '\n') {
            next = this.peekChar()
        }
        // This has to be done since the above line includes the first non-whitespace
        // character after source.charAt(stringIndex)
        this.unpeekChar()
        this.advanceIndex()
    }

    parseSingleChar(): (Token | undefined) {
        const char = this.peekChar()
        switch(char) {
            case '{': return this.tokenFound(TokenType.LeftBrace)
            case '}': return this.tokenFound(TokenType.RightBrace)
            case '|': return this.tokenFound(TokenType.VBar)
            case '=': return this.tokenFound(TokenType.Equals)
            case '<': return this.tokenFound(TokenType.LessThan)
            case '>': return this.tokenFound(TokenType.GreaterThan)
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

    parseMultiChar(): (Token | undefined) {
        let length = 0
        while (!(this.peekChar() in Tokenizer.delimiters)) length++
        // This has to be done since the above line includes the non-matching
        // character in the peeked token
        this.unpeekChar()
        const tokenString = this.source.substring(this.stringIndex, this.peekIndex)
        if (length > 0 && Tokenizer.multiChars.has(tokenString)) {
            // @ts-ignore we can safely ignore the conditional guarantees that tokenString is in multichars
            return this.tokenFound(Tokenizer.multiChars.get(tokenString))
        } else return this.tokenNotFound();
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

    advanceIndex(): void {
        this.stringIndex = this.peekIndex
    }

    tokenFound(type: TokenType): Token {
        const index = this.stringIndex;
        const length = this.peekIndex - this.stringIndex
        const sourceString = this.source.substring(this.stringIndex, this.peekIndex)
        this.advanceIndex()
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

export {
    Tokenizer as default,
    Token,
    TokenType
}