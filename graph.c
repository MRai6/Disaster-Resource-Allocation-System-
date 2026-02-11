#include <stdio.h>
#include <stdlib.h>
#include "graph.h"

Graph* create_graph(int n) {
    Graph* g = (Graph*)malloc(sizeof(Graph));
    if (!g) {
        fprintf(stderr, "Failed to allocate Graph\n");
        exit(EXIT_FAILURE);
    }
    g->num_nodes = n;
    g->adj = (Edge**)calloc(n, sizeof(Edge*));
    if (!g->adj) {
        fprintf(stderr, "Failed to allocate adjacency list array\n");
        free(g);
        exit(EXIT_FAILURE);
    }
    return g;
}

void add_edge(Graph* g, int u, int v, int w) {
    if (!g || u < 0 || u >= g->num_nodes || v < 0 || v >= g->num_nodes) {
        fprintf(stderr, "Invalid edge %d -> %d\n", u, v);
        return;
    }

    Edge* e = (Edge*)malloc(sizeof(Edge));
    if (!e) {
        fprintf(stderr, "Failed to allocate Edge\n");
        exit(EXIT_FAILURE);
    }

    e->to     = v;
    e->weight = w;
    e->next   = g->adj[u];
    g->adj[u] = e;
}

void free_graph(Graph* g) {
    if (!g) return;

    for (int i = 0; i < g->num_nodes; ++i) {
        Edge* cur = g->adj[i];
        while (cur) {
            Edge* tmp = cur;
            cur = cur->next;
            free(tmp);
        }
    }
    free(g->adj);
    free(g);
}

void print_graph(const Graph* g) {
    if (!g) return;

    printf("Graph adjacency lists:\n");
    for (int i = 0; i < g->num_nodes; ++i) {
        printf("Node %d:", i);
        Edge* cur = g->adj[i];
        if (!cur) {
            printf(" (no outgoing edges)");
        }
        while (cur) {
            printf(" -> (%d, w=%d)", cur->to, cur->weight);
            cur = cur->next;
        }
        printf("\n");
    }
}

/* ---------- Dijkstra support: simple min-heap on (node, distance) ---------- */

typedef struct {
    int node;
    int dist;
} MinHeapNode;

typedef struct {
    MinHeapNode* data;
    int size;
    int capacity;
} MinHeap;

static void mh_swap(MinHeapNode* a, MinHeapNode* b) {
    MinHeapNode temp = *a;
    *a = *b;
    *b = temp;
}

static void mh_init(MinHeap* h, int capacity) {
    h->data = (MinHeapNode*)malloc(sizeof(MinHeapNode) * capacity);
    h->size = 0;
    h->capacity = capacity;
}

static void mh_free(MinHeap* h) {
    free(h->data);
    h->data = NULL;
    h->size = h->capacity = 0;
}

static int mh_empty(MinHeap* h) {
    return h->size == 0;
}

static void mh_push(MinHeap* h, int node, int dist) {
    if (h->size == h->capacity) return;  // no resize for simplicity
    int i = h->size++;
    h->data[i].node = node;
    h->data[i].dist = dist;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (h->data[parent].dist <= h->data[i].dist) break;
        mh_swap(&h->data[parent], &h->data[i]);
        i = parent;
    }
}

static MinHeapNode mh_pop(MinHeap* h) {
    MinHeapNode top = h->data[0];
    h->data[0] = h->data[--h->size];
    int i = 0;
    while (1) {
        int left  = 2 * i + 1;
        int right = 2 * i + 2;
        int smallest = i;
        if (left < h->size && h->data[left].dist < h->data[smallest].dist)
            smallest = left;
        if (right < h->size && h->data[right].dist < h->data[smallest].dist)
            smallest = right;
        if (smallest == i) break;
        mh_swap(&h->data[i], &h->data[smallest]);
        i = smallest;
    }
    return top;
}

/* ------------------------- Dijkstra implementation ------------------------- */

void dijkstra(const Graph* g, int source, int dist[]) {
    const int INF = 1000000000;
    int n = g->num_nodes;

    for (int i = 0; i < n; ++i) dist[i] = INF;
    dist[source] = 0;

    MinHeap heap;
    mh_init(&heap, n);
    mh_push(&heap, source, 0);

    while (!mh_empty(&heap)) {
        MinHeapNode cur = mh_pop(&heap);
        int u = cur.node;
        int d = cur.dist;

        if (d > dist[u]) continue; // stale entry

        Edge* e = g->adj[u];
        while (e) {
            int v = e->to;
            int w = e->weight;
            if (dist[u] != INF && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                mh_push(&heap, v, dist[v]);
            }
            e = e->next;
        }
    }

    mh_free(&heap);
}
