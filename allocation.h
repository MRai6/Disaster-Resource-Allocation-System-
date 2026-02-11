#ifndef ALLOCATION_H
#define ALLOCATION_H

#include "graph.h"

// Zone data: multi-resource demands + urgency
typedef struct {
    int id;            // zone (node) id
    int demand_food;   // food units required
    int demand_water;  // water units required
    int urgency;       // higher = more critical (e.g. 1–100)
} Zone;

// Greedy allocation based on urgency only (2 resources: food & water)
void allocate_resources(Zone zones[], int zone_count,
                        int total_food, int total_water);

// Distance-aware allocation: combines urgency with shortest-path distance
// from camp_node computed on the Graph using Dijkstra.
void allocate_resources_with_distance(Zone zones[], int zone_count,
                                      int total_food, int total_water,
                                      const Graph* g, int camp_node);

#endif
