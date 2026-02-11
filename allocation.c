#include <stdio.h>
#include <stdlib.h>
#include "allocation.h"
#include "priority_queue.h"
#include "graph.h"

static Zone* find_zone_by_id(Zone zones[], int zone_count, int id) {
    for (int i = 0; i < zone_count; ++i) {
        if (zones[i].id == id) return &zones[i];
    }
    return NULL;
}

/*
 * Allocation based only on urgency (2 resources: food and water)
 */
void allocate_resources(Zone zones[], int zone_count,
                        int total_food, int total_water) {
    PriorityQueue pq;
    pq_init(&pq, zone_count);

    // Insert all zones into priority queue by urgency
    for (int i = 0; i < zone_count; ++i) {
        pq_push(&pq, zones[i].id, zones[i].urgency);
    }

    int remaining_food  = total_food;
    int remaining_water = total_water;

    printf("\n=== Allocation plan (urgency-based, 2 resources) ===\n");

    while (!pq_empty(&pq) && (remaining_food > 0 || remaining_water > 0)) {
        PQNode top = pq_pop(&pq);
        int zid = top.zone_id;

        Zone* z = find_zone_by_id(zones, zone_count, zid);
        if (!z) continue;

        int send_food  = 0;
        int send_water = 0;

        if (remaining_food > 0 && z->demand_food > 0) {
            send_food = z->demand_food;
            if (send_food > remaining_food) send_food = remaining_food;
        }

        if (remaining_water > 0 && z->demand_water > 0) {
            send_water = z->demand_water;
            if (send_water > remaining_water) send_water = remaining_water;
        }

        if (send_food == 0 && send_water == 0) {
            continue;
        }

        printf("Zone %d [urgency=%d]: "
               "food (demand=%d, send=%d), "
               "water (demand=%d, send=%d)\n",
               z->id, z->urgency,
               z->demand_food, send_food,
               z->demand_water, send_water);

        remaining_food  -= send_food;
        remaining_water -= send_water;
        z->demand_food  -= send_food;
        z->demand_water -= send_water;
    }

    printf("Remaining at camp: food=%d, water=%d\n",
           remaining_food, remaining_water);

    pq_free(&pq);
}

/*
 * Allocation using urgency + distance score (2 resources)
 */
void allocate_resources_with_distance(Zone zones[], int zone_count,
                                      int total_food, int total_water,
                                      const Graph* g, int camp_node) {
    // 1. Compute shortest distance from camp_node to all nodes
    int* dist = (int*)malloc(sizeof(int) * g->num_nodes);
    if (!dist) {
        fprintf(stderr, "Failed to allocate dist array\n");
        exit(EXIT_FAILURE);
    }
    dijkstra(g, camp_node, dist);

    // 2. Build a score combining urgency and distance
    PriorityQueue pq;
    pq_init(&pq, zone_count);

    for (int i = 0; i < zone_count; ++i) {
        int zid = zones[i].id;
        int d = (zid >= 0 && zid < g->num_nodes) ? dist[zid] : 1000000000;
        int score = zones[i].urgency * 1000 - d; // bigger = better
        pq_push(&pq, zones[i].id, score);
    }

    int remaining_food  = total_food;
    int remaining_water = total_water;

    printf("\n=== Allocation plan (urgency + distance, 2 resources) ===\n");

    while (!pq_empty(&pq) && (remaining_food > 0 || remaining_water > 0)) {
        PQNode top = pq_pop(&pq);
        int zid = top.zone_id;

        Zone* z = find_zone_by_id(zones, zone_count, zid);
        if (!z) continue;

        int send_food  = 0;
        int send_water = 0;

        if (remaining_food > 0 && z->demand_food > 0) {
            send_food = z->demand_food;
            if (send_food > remaining_food) send_food = remaining_food;
        }

        if (remaining_water > 0 && z->demand_water > 0) {
            send_water = z->demand_water;
            if (send_water > remaining_water) send_water = remaining_water;
        }

        if (send_food == 0 && send_water == 0) {
            continue;
        }

        int d = (zid >= 0 && zid < g->num_nodes) ? dist[zid] : -1;
        printf("Zone %d [urgency=%d, dist=%d]: "
               "food (demand=%d, send=%d), "
               "water (demand=%d, send=%d)\n",
               z->id, z->urgency, d,
               z->demand_food, send_food,
               z->demand_water, send_water);

        remaining_food  -= send_food;
        remaining_water -= send_water;
        z->demand_food  -= send_food;
        z->demand_water -= send_water;
    }

    printf("Remaining at camp: food=%d, water=%d\n",
           remaining_food, remaining_water);

    pq_free(&pq);
    free(dist);
}
