import Tokenizer, {Token, TokenType} from './Tokenizer'
import RollbackIterator from './RollbackIterator'

abstract class SyntaxTreeVisitor {

    public abstract accept(node: AbstractSyntaxTreeNode): void;

}
//AbstractSyntaxTreeNode
// | BranchNode
//   | DefNode
//   | FormulaNode
//     | PredicateNode
//     | NegationNode
//     | BinaryConnectiveNode
//     | EqualityNode
//     | QuantifierNode
// | TerminalNode
//   | SymbolNode
//   | TypeNode
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
        private readonly name: SymbolNode,
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

        this.tokenizer.createRollbackPoint()
        for (const token of this.tokenizer) {
            console.log(`${token}`)
        }
        this.tokenizer.rollback()

        this.definition()
    }

    private definition(): (DefNode | null) {
        this.tokenizer.createRollbackPoint()

        const defToken = this.tokenizer.next().value
        if (defToken.type !== TokenType.KW_DEF) return this.nonMatch()

        const typeToken = this.tokenizer.next().value
        if (typeToken.type !== TokenType.TYPE) return this.nonMatch()

        const lBraceToken = this.tokenizer.next().value
        if (lBraceToken.type !== TokenType.SYM_LBRACE) return this.nonMatch()

        const formula = this.formula()
        if (formula == null) return this.nonMatch()

        const rBraceToken = this.tokenizer.next().value
        if (rBraceToken.type !== TokenType.SYM_RBRACE) return this.nonMatch()

        this.tokenizer.removeRollback()
        return new DefNode(defToken, new TypeNode(typeToken), formula);
    }

    private formula(): (FormulaNode | null) {
        this.tokenizer.createRollbackPoint()

        this.tokenizer.removeRollback()
        return null
    }

    private nonMatch(): null {
        this.tokenizer.rollback()
        return null
    }



}

export default Parser