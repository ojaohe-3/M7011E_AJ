export interface Position{
    x : number;
    y : number;
}

export class Node{

    id : String;
    pos : Position;
    nodes: Map<String, Node>;
    value : any;

    Node(value){
        this.value = value;
    }
    
    addNode(n : Node){
        this.nodes.set(n.id, n);
    }
}