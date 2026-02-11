#include <stdlib.h>
#include <stdio.h>
#include "priority_queue.h"

static void swap(PQNode* a, PQNode* b) {
    PQNode temp = *a;
    *a = *b;
    *b = temp;
}

void pq_init(PriorityQueue* pq, int capacity) {
    pq->data = (PQNode*)malloc(sizeof(PQNode) * capacity);
    if (!pq->data) {
        fprintf(stderr, "Failed to allocate PriorityQueue data\n");
        exit(EXIT_FAILURE);
    }
    pq->size = 0;
    pq->capacity = capacity;
}

void pq_free(PriorityQueue* pq) {
    free(pq->data);
    pq->data = NULL;
    pq->size = pq->capacity = 0;
}

int pq_empty(PriorityQueue* pq) {
    return pq->size == 0;
}

void pq_push(PriorityQueue* pq, int zone_id, int priority) {
    if (pq->size == pq->capacity) {
        fprintf(stderr, "PriorityQueue is full, cannot insert\n");
        return;
    }

    int i = pq->size++;
    pq->data[i].zone_id  = zone_id;
    pq->data[i].priority = priority;

    // Heapify up (max-heap)
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (pq->data[parent].priority >= pq->data[i].priority) break;
        swap(&pq->data[parent], &pq->data[i]);
        i = parent;
    }
}

PQNode pq_pop(PriorityQueue* pq) {
    if (pq_empty(pq)) {
        fprintf(stderr, "PriorityQueue underflow in pq_pop\n");
        PQNode dummy = { -1, -1 };
        return dummy;
    }

    PQNode top = pq->data[0];
    pq->data[0] = pq->data[--pq->size];

    // Heapify down
    int i = 0;
    while (1) {
        int left  = 2 * i + 1;
        int right = 2 * i + 2;
        int largest = i;

        if (left < pq->size &&
            pq->data[left].priority > pq->data[largest].priority) {
            largest = left;
        }
        if (right < pq->size &&
            pq->data[right].priority > pq->data[largest].priority) {
            largest = right;
        }
        if (largest == i) break;

        swap(&pq->data[i], &pq->data[largest]);
        i = largest;
    }

    return top;
}
