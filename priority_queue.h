#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

// Max-heap node used for prioritizing zones in allocation
typedef struct {
    int zone_id;   // zone identifier
    int priority;   // higher value = more urgent / higher score
} PQNode;

// Binary max-heap priority queue
typedef struct {
    PQNode* data;  // array of heap nodes
    int size;      // current number of elements
    int capacity;  // maximum elements that can be stored
} PriorityQueue;

// Initialize heap with given capacity (size set to 0)
void pq_init(PriorityQueue* pq, int capacity);

// Free heap memory and reset fields
void pq_free(PriorityQueue* pq);

// Return 1 if empty, else 0
int pq_empty(PriorityQueue* pq);

// Insert node (zone_id, priority) into max-heap
void pq_push(PriorityQueue* pq, int zone_id, int priority);

// Remove and return max-priority node from heap
PQNode pq_pop(PriorityQueue* pq);

#endif
