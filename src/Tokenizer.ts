const isAlphabetical = (char: string): boolean => {
    if (char.length > 1) throw new Error('Argument "char" must have a length of 1')
    else if (char.length === 0) return false
    const lowerCaseCodePoint = char.charCodeAt(0) | 32
    return 97 <= lowerCaseCodePoint && lowerCaseCodePoint <= 122
}
const isNumerical = (char: string): boolean => {
    if (char.length > 1) throw new Error('Argument "char" must have a length of 1')
    else if (char.length === 0) return false
    const codePoint = char.charCodeAt(0)
    return 48 <= codePoint && codePoint <= 57
}
const isOtherValidSymbol = (char: string): boolean => {
    if (char.length > 1) throw new Error('Argument "char" must have a length of 1')
    else if (char.length === 0) return false
    return (
        char === '+' || char === '-'
        || char === '*' || char === '/'
        || char === '^' || char === '_'
        || char === '='
    )
}

enum TokenType {
    KW_DEF, KW_WHERE,
    KW_FORALL, KW_EXIST,
    KW_EMPTYSET,
    KW_IN, KW_SUBSET, KW_SUBSETEQ,
    KW_UNION, KW_INTERSECT,

    SYM_COMMA, SYM_COLON, SYM_RIGHT_ARROW, SYM_SLASH, SYM_VBAR,
    SYM_LPAREN, SYM_RPAREN, SYM_LBRACE, SYM_RBRACE,

    SYMBOL,

    END_STREAM
}

class Tokenizer implements Iterable<Token> {

    private readonly source: string
    private stringIndex: number
    private peekIndex: number

    private static readonly multiChars: Map<string, TokenType> =
        new Map([
            ['def', TokenType.KW_DEF],
            ['where', TokenType.KW_WHERE],
            ['forall', TokenType.KW_FORALL],
            ['exist', TokenType.KW_EXIST],
            ['emptyset', TokenType.KW_EMPTYSET],
            ['in', TokenType.KW_IN],
            ['subset', TokenType.KW_SUBSET],
            ['subseteq', TokenType.KW_SUBSETEQ],
            ['union', TokenType.KW_UNION],
            ['intersect', TokenType.KW_INTERSECT],
            ['->', TokenType.SYM_RIGHT_ARROW]
        ])
    private static readonly delimiters: string[] = [
        ' ', '\n', '\t', ''
    ]


    constructor(source: string) {
        this.source = source.trim()
        this.stringIndex = 0
        this.peekIndex = 0
    }

    [Symbol.iterator](): Iterator<Token> {
        return {
            next: (): IteratorResult<Token> => {
                const token = this.nextToken()
                if (token.type === TokenType.END_STREAM) {
                    return { value: token, done: true }
                } else {
                    return { value: token, done: false }
                }
            }
        }
    }

    nextToken(): Token {
        //We need to skip the whitespace at the current index if there is any
        this.skipWhiteSpace()
        if (this.stringIndex === this.source.length) return this.tokenFound(TokenType.END_STREAM)
        let result = this.parseSingleChar()
        if (result !== undefined) return result
        result = this.parseMultiChar()
        if (result !== undefined) return result
        result = this.parseSymbol()
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
            case '{': return this.tokenFound(TokenType.SYM_LBRACE)
            case '}': return this.tokenFound(TokenType.SYM_RBRACE)
            case '|': return this.tokenFound(TokenType.SYM_VBAR)
            case '\\': return this.tokenFound(TokenType.SYM_SLASH)
            case '(': return this.tokenFound(TokenType.SYM_LPAREN)
            case ')': return this.tokenFound(TokenType.SYM_RPAREN)
            case ',': return this.tokenFound(TokenType.SYM_COMMA)
            case ':': return this.tokenFound(TokenType.SYM_COLON)
            default: return this.tokenNotFound()
        }
    }

    parseMultiChar(): (Token | undefined) {
        let length = 0
        while (!(Tokenizer.delimiters.includes(this.peekChar()))) length++
        // This has to be done since the above line includes the non-matching
        // character in the peeked token
        this.unpeekChar()
        const tokenString = this.source.substring(this.stringIndex, this.peekIndex)
        if (length > 0 && Tokenizer.multiChars.has(tokenString)) {
            // @ts-ignore we can safely ignore since the conditional guarantees that tokenString is in multichars
            return this.tokenFound(Tokenizer.multiChars.get(tokenString))
        } else return this.tokenNotFound();
    }

    parseSymbol(): (Token | undefined) {
        let length = 0
        let char = this.peekChar()
        while (isAlphabetical(char) || isNumerical(char) || isOtherValidSymbol(char)) {
            length++
            char = this.peekChar()
        }
        // This has to be done since we consistently over count by one, since equality is checked
        // on the following iteration
        this.unpeekChar()
        if (length > 0) return this.tokenFound(TokenType.SYMBOL)
        else return this.tokenNotFound()
    }

    peekChar(): string {
        return (this.source.charAt(this.peekIndex++) ?? '')
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