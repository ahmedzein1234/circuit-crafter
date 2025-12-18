/**
 * Circuit graph representation for solving
 */

import type { CircuitComponent, Wire } from '@circuit-crafter/shared';

export interface GraphNode {
  id: string;
  componentId: string;
  terminalId: string;
  terminalType: string;
  voltage: number;
  connectedNodes: string[];
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  wireId?: string;
  componentId?: string;
  componentType?: string;
  resistance: number;
  current: number;
}

export class CircuitGraph {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge> = new Map();
  private nodesByTerminal: Map<string, string> = new Map();

  constructor(components: CircuitComponent[], wires: Wire[]) {
    this.buildGraph(components, wires);
  }

  private buildGraph(components: CircuitComponent[], wires: Wire[]): void {
    // Create nodes for each terminal
    for (const component of components) {
      for (const terminal of component.terminals) {
        const nodeId = `node-${terminal.id}`;
        this.nodes.set(nodeId, {
          id: nodeId,
          componentId: component.id,
          terminalId: terminal.id,
          terminalType: terminal.type,
          voltage: 0,
          connectedNodes: [],
        });
        this.nodesByTerminal.set(terminal.id, nodeId);
      }

      // Create edges within components (connecting their terminals)
      if (component.terminals.length === 2) {
        const [terminal1, terminal2] = component.terminals;
        const node1Id = this.nodesByTerminal.get(terminal1.id)!;
        const node2Id = this.nodesByTerminal.get(terminal2.id)!;

        const resistance = this.getComponentResistance(component);

        const edgeId = `edge-${component.id}`;
        this.edges.set(edgeId, {
          id: edgeId,
          sourceNodeId: node1Id,
          targetNodeId: node2Id,
          componentId: component.id,
          componentType: component.type,
          resistance,
          current: 0,
        });

        // Add bidirectional connections
        const node1 = this.nodes.get(node1Id)!;
        const node2 = this.nodes.get(node2Id)!;
        node1.connectedNodes.push(node2Id);
        node2.connectedNodes.push(node1Id);
      }
    }

    // Create edges for wires
    for (const wire of wires) {
      const sourceNodeId = this.nodesByTerminal.get(wire.fromTerminal);
      const targetNodeId = this.nodesByTerminal.get(wire.toTerminal);

      if (sourceNodeId && targetNodeId) {
        const edgeId = `wire-${wire.id}`;
        this.edges.set(edgeId, {
          id: edgeId,
          sourceNodeId,
          targetNodeId,
          wireId: wire.id,
          resistance: 0.001, // Small resistance for wires
          current: 0,
        });

        // Add bidirectional connections
        const sourceNode = this.nodes.get(sourceNodeId)!;
        const targetNode = this.nodes.get(targetNodeId)!;
        sourceNode.connectedNodes.push(targetNodeId);
        targetNode.connectedNodes.push(sourceNodeId);
      }
    }
  }

  private getComponentResistance(component: CircuitComponent): number {
    switch (component.type) {
      case 'battery':
        return 0.001; // Internal resistance
      case 'resistor':
        return component.properties.resistance || 1000;
      case 'led':
        return 100; // Simplified LED resistance
      case 'switch':
        return component.properties.isOpen ? Infinity : 0.001;
      case 'wire':
        return 0.001;
      case 'ground':
        return 0.001;
      default:
        return 1000;
    }
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }

  getNodeByTerminal(terminalId: string): GraphNode | undefined {
    const nodeId = this.nodesByTerminal.get(terminalId);
    return nodeId ? this.nodes.get(nodeId) : undefined;
  }

  findPath(fromNodeId: string, toNodeId: string): string[] | null {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: fromNodeId, path: [fromNodeId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === toNodeId) {
        return path;
      }

      if (visited.has(nodeId)) {
        continue;
      }
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const connectedNodeId of node.connectedNodes) {
          if (!visited.has(connectedNodeId)) {
            queue.push({ nodeId: connectedNodeId, path: [...path, connectedNodeId] });
          }
        }
      }
    }

    return null;
  }

  findAllPaths(fromNodeId: string, toNodeId: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[]) => {
      if (currentId === toNodeId) {
        paths.push([...path]);
        return;
      }

      visited.add(currentId);
      const node = this.nodes.get(currentId);
      if (node) {
        for (const connectedNodeId of node.connectedNodes) {
          if (!visited.has(connectedNodeId)) {
            dfs(connectedNodeId, [...path, connectedNodeId]);
          }
        }
      }
      visited.delete(currentId);
    };

    dfs(fromNodeId, [fromNodeId]);
    return paths;
  }
}
