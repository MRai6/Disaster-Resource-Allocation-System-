#ifndef GRAPH_H
#define GRAPH_H

// Edge in adjacency list: directed edge u -> to with given weight
typedef struct Edge {
    int to;              // destination node index
    int weight;          // cost (time / distance, non-negative)
    struct Edge* next;   // next edge in adjacency list
} Edge;

// Graph with adjacency-list representation
typedef struct {
    int   num_nodes;     // total number of nodes (0 .. num_nodes-1)
    Edge** adj;          // array of adjacency list heads (Edge* per node)
} Graph;

// Create a graph with n nodes (0..n-1), adjacency lists initially empty
Graph* create_graph(int n);

// Add a directed edge u -> v with weight w to the adjacency list
void add_edge(Graph* g, int u, int v, int w);

// Free all memory used by the graph (all edges + adj array)
void free_graph(Graph* g);

// Debug helper: print adjacency lists for all nodes
void print_graph(const Graph* g);

// Single-source shortest paths using Dijkstra (adjacency list + min-heap).
// Fills dist[0..num_nodes-1] with minimum distance from 'source' to each node.
// Assumes all edge weights are non-negative.
void dijkstra(const Graph* g, int source, int dist[]);

#endif
