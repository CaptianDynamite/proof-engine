import Tokenizer, {Token} from './Tokenizer';

abstract class SyntaxTreeVisitor {

    public abstract accept(node: AbstractSyntaxTreeNode): void;

}


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
    protected constructor(
        token: Token,
        private readonly name: SymbolNode,
        private readonly constraints: WhereNode,
        //TODO variables node
    ) {
        super(token);
    }
}
class ConstraintNode extends BranchNode {
    protected constructor(token: Token) {
        super(token);
    }
}
class WhereNode extends BranchNode {
    protected constructor(token: Token) {
        super(token);
    }

    protected override addChild(node: ConstraintNode) {
        super.addChild(node);
    }
}
class ParenthesesNode extends BranchNode {
    protected constructor(token: Token) {
        super(token);
    }
}
class BracesNode extends BranchNode {
    protected constructor(token: Token) {
        super(token);
    }
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


class Parser {

    constructor(private readonly tokenizer: Tokenizer) {}

    parse(): void {
        for (const token of this.tokenizer) {
            console.log(`${token}`)
        }
    }

}

export default Parser