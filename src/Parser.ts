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


    protected constructor(private readonly token: Token) {}

    public visit(visitor: SyntaxTreeVisitor): void {
        visitor.accept(this)
    }

}

abstract class BranchNode extends AbstractSyntaxTreeNode {

    private children: AbstractSyntaxTreeNode[]

    protected constructor(token: Token) {
        super(token);
        this.children = []
    }

    protected addChild(node: AbstractSyntaxTreeNode) {
        this.children.push(node)
    }
}

class DefNode extends BranchNode {
    constructor(
        token: Token,
        private readonly type: TypeNode,
    ) {
        super(token);
    }
}
class FormulaNode extends BranchNode {

}
abstract class TerminalNode extends AbstractSyntaxTreeNode {
    protected constructor(token: Token) {
        super(token);
    }
}
class SymbolNode extends TerminalNode {
    protected constructor(token: Token) {
        super(token);
    }
}
class TypeNode extends TerminalNode {
    constructor(token: Token) {
        super(token);
    }
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

    private definition(): void {
        this.tokenizer.createRollbackPoint()
        const defToken = this.tokenizer.next().value
        if (defToken.type !== TokenType.KW_DEF) this.nonMatch()
        const typeToken = this.tokenizer.next().value
        if (typeToken.type !== TokenType.TYPE) this.nonMatch()

        const defNode = new DefNode(defToken, new TypeNode(typeToken));
        console.log(defNode)
    }

    private nonMatch(): void {
        this.tokenizer.rollback()
    }

}

export default Parser