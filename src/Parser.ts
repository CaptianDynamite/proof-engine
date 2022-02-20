import Tokenizer from './Tokenizer';

abstract class SyntaxTreeVisitor {

    public abstract accept(node: AbstractSyntaxTreeNode): void;

}


abstract class AbstractSyntaxTreeNode {
    private children: AbstractSyntaxTreeNode[];

    protected constructor() {
        this.children = []
    }

    public abstract visit(visitor: SyntaxTreeVisitor): void;

}


class Parser {

    constructor(private readonly tokenizer: Tokenizer) {}

    parse(): void {

    }

}