export interface Position{
    x : number;
    y : number;
}

export class Node{

    id! : String;
    pos! : Position;
    connections!: Map<String, Edge>;

    constructor(){
    }
    
    addNode(n : Node){
        this.connections.set(n.id, new Edge(this, n)); 

    }
}

class Edge{
    id!: String;
    disc!: String;
    start!: Node;
    end!: Node;
    constructor(start: Node, end: Node){
        this.start = start;
        this.end = end;
    }
}