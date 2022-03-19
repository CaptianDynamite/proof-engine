import Tokenizer, {Token, TokenType} from './Tokenizer'
import RollbackIterator from './RollbackIterator'

abstract class SyntaxTreeVisitor {

    public abstract accept(node: AbstractSyntaxTreeNode): void;

}

abstract class AbstractSyntaxTreeNode {

    constructor(private readonly token: Token) {}

    public visit(visitor: SyntaxTreeVisitor): void {
        visitor.accept(this)
    }

}

abstract class DocumentNode extends AbstractSyntaxTreeNode {
    protected constructor(
        token: Token
    ) {
        super(token)
    }
}

class DefNode extends DocumentNode {
    constructor(
        token: Token,
        private readonly type: TypeNode,
        private readonly formula: FormulaNode
    ) {
        super(token)
    }
}
class FormulaNode extends DocumentNode {
}
class EqualNode extends FormulaNode {
    constructor(
        token: Token,
        private readonly lhs: FormulaNode,
        private readonly rhs: FormulaNode
    ) {
        super(token)
    }
}
class NegationNode extends FormulaNode {
    constructor(
        token: Token,
        private readonly formula: FormulaNode
    ) {
        super(token)
    }
}
class BinaryNode extends FormulaNode {
    constructor(
        token: Token,
        private readonly lhs: FormulaNode,
        private readonly rhs: FormulaNode
    ) {
        super(token)
    }
}
class AndNode extends BinaryNode {
}
class OrNode extends BinaryNode {
}
class ThenNode extends BinaryNode {
}
class BidirectionalNode extends BinaryNode {
}
class QuantifierNode extends FormulaNode {
    constructor(
        token: Token,
        private readonly variable: VariableNode,
        private readonly formula: FormulaNode
    ) {
        super(token)
    }
}
class ForallNode extends QuantifierNode {
}
class ExistNode extends QuantifierNode {
}

class TermNode extends DocumentNode {
    constructor(
        token: Token,
    ) {
        super(token)
    }
}
class VariableNode extends TermNode {
}
class FunctionNode extends TermNode {
    constructor(
        token: Token,
        private readonly functionName: SymbolNode,
        private readonly terms: TermNode[]
    ) {
        super(token)
    }
}

class PredicateNode extends AbstractSyntaxTreeNode {
    constructor(
        token: Token,
        private readonly terms: TermNode[]
    ) {
        super(token)
    }
}
class SymbolNode extends AbstractSyntaxTreeNode {
}
class TypeNode extends AbstractSyntaxTreeNode {
}

class Parser {

    private readonly tokenizer: RollbackIterator<Token>

    constructor(tokenizer: Tokenizer) {
        this.tokenizer = new RollbackIterator<Token>(tokenizer)
    }

    parse(): void {
        console.log(this.definition())
    }

    private definition(): (DefNode | null) {
        this.tokenizer.createRollbackPoint()

        const defToken = this.tokenizer.next().value
        if (defToken.type !== TokenType.KW_DEF) return this.nonMatch()

        const typeToken = this.tokenizer.next().value
        if (typeToken.type !== TokenType.TYPE) return this.nonMatch()

        const lBraceToken = this.tokenizer.next().value
        if (lBraceToken.type !== TokenType.SYM_LBRACE) return this.nonMatch()

        console.log('!')

        const formula = this.formula()
        if (formula === null) return this.nonMatch()

        console.log('!')

        const rBraceToken = this.tokenizer.next().value
        if (rBraceToken.type !== TokenType.SYM_RBRACE) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new DefNode(defToken, new TypeNode(typeToken), formula);
    }

    private formula(): (FormulaNode | null) {
        this.tokenizer.createRollbackPoint()

        let formulaNode: (FormulaNode | null) = this.binaryConnectiveFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.parenthesesFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.quantifierFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.negationFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.equalityFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.predicate()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }

        return this.nonMatch()
    }

    parenthesesFormula(): (FormulaNode | null) {
        this.tokenizer.createRollbackPoint()

        const lparenToken = this.tokenizer.next().value
        if (lparenToken.type !== TokenType.SYM_LPAREN) return this.nonMatch()

        const formulaNode = this.formula()
        if (formulaNode === null) return this.nonMatch()

        const rparenToken = this.tokenizer.next().value
        if (rparenToken.type !== TokenType.SYM_RPAREN) return this.nonMatch()

        this.tokenizer.removeRollback()
        return formulaNode
    }

    quantifierFormula(): (QuantifierNode | null) {
        this.tokenizer.createRollbackPoint()

        const quantifier = this.tokenizer.next().value
        if (
            quantifier.type !== TokenType.KW_FORALL
            && quantifier.type !== TokenType.KW_EXISTS
        ) return this.nonMatch()

        const variableNode = this.variable()
        if (variableNode === null) return this.nonMatch()

        const formulaNode = this.formula()
        if (formulaNode === null) return this.nonMatch()

        this.tokenizer.removeRollback()
        if (quantifier.type === TokenType.KW_FORALL)
            return  new ForallNode(quantifier, variableNode, formulaNode)
        else return  new ExistNode(quantifier, variableNode, formulaNode)
    }

    binaryConnectiveFormula(): (BinaryNode | null) {
        this.tokenizer.createRollbackPoint()

        const lhs = this.binaryLhs()
        if (lhs === null) return this.nonMatch()

        const connective = this.tokenizer.next().value
        if (
            connective.type !== TokenType.KW_AND
            && connective.type !== TokenType.KW_OR
            && connective.type !== TokenType.SYM_RIGHT_ARROW
            && connective.type !== TokenType.SYM_BIDIRECTIONAL_ARROW
        ) return this.nonMatch()

        const rhs = this.formula()
        if (rhs === null) return this.nonMatch()

        this.tokenizer.removeRollback()
        if (connective.type === TokenType.KW_AND)
            return new AndNode(connective, lhs, rhs)
        else if (connective.type === TokenType.KW_OR)
            return new OrNode(connective, lhs, rhs)
        else if (connective.type === TokenType.SYM_RIGHT_ARROW)
            return new ThenNode(connective, lhs, rhs)
        else return new BidirectionalNode(connective, lhs, rhs)
    }

    binaryLhs(): (FormulaNode | null) {
        this.tokenizer.createRollbackPoint()

        let formulaNode = this.parenthesesFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.quantifierFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.negationFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.equalityFormula()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }
        formulaNode = this.predicate()
        if (formulaNode !== null) {
            this.tokenizer.removeRollback()
            return formulaNode
        }


        return this.nonMatch()
    }

    negationFormula(): (NegationNode | null) {
        this.tokenizer.createRollbackPoint()

        const notToken = this.tokenizer.next().value
        if (notToken.type !== TokenType.SYM_NOT) return this.nonMatch()

        const formulaNode = this.formula()
        if (formulaNode === null) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new NegationNode(notToken, formulaNode)
    }

    equalityFormula(): (EqualNode | null) {
        this.tokenizer.createRollbackPoint()

        const lhs = this.term()
        if (lhs === null) return this.nonMatch()

        const equalToken = this.tokenizer.next().value
        if (equalToken.type !== TokenType.SYM_EQUALS) return this.nonMatch()

        const rhs = this.term()
        if (rhs === null) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new EqualNode(equalToken, lhs, rhs)
    }

    term(): (TermNode | null) {
        this.tokenizer.createRollbackPoint()

        let termNode: (TermNode | null) = this.function()
        if (termNode !== null) {
            this.tokenizer.removeRollback()
            return termNode
        }
        termNode = this.variable()
        if (termNode !== null) {
            this.tokenizer.removeRollback()
            return termNode
        }


        return this.nonMatch()
    }

    variable(): (VariableNode | null) {
        this.tokenizer.createRollbackPoint()

        const symbolToken = this.tokenizer.next().value
        if (symbolToken.type !== TokenType.SYMBOL) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new VariableNode(symbolToken)
    }

    function(): (FunctionNode | null) {
        this.tokenizer.createRollbackPoint()

        const symbolToken = this.tokenizer.next().value
        if (symbolToken.type !== TokenType.SYMBOL) return this.nonMatch()

        const lparenToken = this.tokenizer.next().value
        if (lparenToken.type !== TokenType.SYM_LPAREN) return this.nonMatch()

        const termListNodes = this.termList()
        if (termListNodes === null) return this.nonMatch()

        const rparenToken = this.tokenizer.next().value
        if (rparenToken.type !== TokenType.SYM_RPAREN) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new FunctionNode(symbolToken, new SymbolNode(symbolToken), termListNodes)
    }

    predicate(): (PredicateNode | null) {
        this.tokenizer.createRollbackPoint()

        const predicateToken = this.tokenizer.next().value
        if (
            predicateToken.type !== TokenType.TYPE
            && predicateToken.type !== TokenType.KW_IN
        ) return this.nonMatch()

        const lparenToken = this.tokenizer.next().value
        if (lparenToken.type !== TokenType.SYM_LPAREN) return this.nonMatch()

        const termListNodes = this.termList()
        if (termListNodes === null) return this.nonMatch()

        const rparenToken = this.tokenizer.next().value
        if (rparenToken.type !== TokenType.SYM_RPAREN) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new PredicateNode(predicateToken, termListNodes)
    }

    termList(): (TermNode[] | null) {
        this.tokenizer.createRollbackPoint()

        const firstTerm = this.term()
        if (firstTerm === null) {
            this.tokenizer.removeRollback()
            return []
        }

        let terms = [firstTerm]

        while (this.tokenizer.next().value.type === TokenType.SYM_COMMA) {
            const term = this.term()
            if (term === null) {
                this.tokenizer.rollback()
                return null
            }
            terms.push(term)
        }
        this.tokenizer.moveBack()
        this.tokenizer.removeRollback()
        return terms
    }

    private nonMatch(): null {
        this.tokenizer.rollback()
        return null
    }

}

export default Parser