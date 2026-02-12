#include <stdio.h>
#include <stdlib.h>
#include "graph.h"
#include "allocation.h"

#define MAX_SUPPLY 300
#define MAX_ZONES  50

// ----------------------- Graph Input -----------------------

static void read_graph_from_user(Graph** out_graph) {
    int num_nodes, num_edges;

    printf("Enter number of nodes (including camp + zones): ");
    if (scanf("%d", &num_nodes) != 1 || num_nodes <= 0) {
        fprintf(stderr, "Invalid number of nodes.\n");
        exit(EXIT_FAILURE);
    }

    Graph* g = create_graph(num_nodes);

    printf("Enter number of directed roads (edges): ");
    if (scanf("%d", &num_edges) != 1 || num_edges < 0) {
        fprintf(stderr, "Invalid number of edges.\n");
        free_graph(g);
        exit(EXIT_FAILURE);
    }

    printf("Assume nodes are numbered 0 to %d\n", num_nodes - 1);
    printf("\n-------- NODE 0 IS THE MAIN CAMP --------\n\n");
    printf("Enter each road as: <from> <to> <time_or_distance>\n");

    for (int i = 0; i < num_edges; ++i) {
        int u, v, w;
        printf("Edge %d: ", i + 1);
        if (scanf("%d %d %d", &u, &v, &w) != 3) {
            fprintf(stderr, "Invalid edge input.\n");
            free_graph(g);
            exit(EXIT_FAILURE);
        }
        add_edge(g, u, v, w);
    }

    *out_graph = g;
}

// ----------------------- Zones + Supply Input -----------------------

static void read_zones_from_user(Zone** out_zones,
                                 int* out_zone_count,
                                 int* out_total_food,
                                 int* out_total_water) {
    int zone_count;
    printf("\nEnter number of affected zones (excluding camp node 0): ");
    if (scanf("%d", &zone_count) != 1 ||
        zone_count <= 0 || zone_count > MAX_ZONES) {
        fprintf(stderr, "Zone count must be between 1 and %d.\n", MAX_ZONES);
        exit(EXIT_FAILURE);
    }

    Zone* zones = (Zone*)malloc(sizeof(Zone) * zone_count);
    if (!zones) {
        fprintf(stderr, "Failed to allocate zones array.\n");
        exit(EXIT_FAILURE);
    }

    printf("We will treat zones as node IDs 1..%d (or any valid node IDs you want).\n",
           zone_count);

    for (int i = 0; i < zone_count; ++i) {
        int id, demand_food, demand_water, urgency;

        printf("\nZone %d:\n", i + 1);

        printf("  Enter zone node id: ");
        if (scanf("%d", &id) != 1) {
            fprintf(stderr, "Invalid zone id.\n");
            free(zones);
            exit(EXIT_FAILURE);
        }

        printf("  Enter FOOD demand (units): ");
        if (scanf("%d", &demand_food) != 1 || demand_food < 0) {
            fprintf(stderr, "Invalid food demand.\n");
            free(zones);
            exit(EXIT_FAILURE);
        }

        printf("  Enter WATER demand (units): ");
        if (scanf("%d", &demand_water) != 1 || demand_water < 0) {
            fprintf(stderr, "Invalid water demand.\n");
            free(zones);
            exit(EXIT_FAILURE);
        }

        printf("  Enter urgency (higher = more critical, 1-300): ");
        if (scanf("%d", &urgency) != 1 || urgency < 0 || urgency > 300) {
            fprintf(stderr, "Invalid urgency.\n");
            free(zones);
            exit(EXIT_FAILURE);
        }

        zones[i].id           = id;
        zones[i].demand_food  = demand_food;
        zones[i].demand_water = demand_water;
        zones[i].urgency      = urgency;
    }

    int total_food, total_water;

    printf("\nEnter total FOOD supply at camp (0 to %d): ", MAX_SUPPLY);
    if (scanf("%d", &total_food) != 1 ||
        total_food < 0 || total_food > MAX_SUPPLY) {
        fprintf(stderr, "Total food supply must be between 0 and %d.\n", MAX_SUPPLY);
        free(zones);
        exit(EXIT_FAILURE);
    }

    printf("Enter total WATER supply at camp (0 to %d): ", MAX_SUPPLY);
    if (scanf("%d", &total_water) != 1 ||
        total_water < 0 || total_water > MAX_SUPPLY) {
        fprintf(stderr, "Total water supply must be between 0 and %d.\n", MAX_SUPPLY);
        free(zones);
        exit(EXIT_FAILURE);
    }

    *out_zones       = zones;
    *out_zone_count  = zone_count;
    *out_total_food  = total_food;
    *out_total_water = total_water;
}

// ----------------------- main -----------------------

int main(void) {
    Graph* g          = NULL;
    Zone*  zones      = NULL;
    int    zone_count = 0;
    int    total_food = 0;
    int    total_water = 0;

    printf("=== Disaster Resource Allocation System ===\n\n");

    // 1. Read network (graph)
    read_graph_from_user(&g);
    printf("\nYou entered the following graph:\n");
    print_graph(g);

    // 2. Read zones, demands (food & water), urgencies, and total supplies
    read_zones_from_user(&zones, &zone_count, &total_food, &total_water);

    printf("\nCamp total supply: food=%d, water=%d units\n",
           total_food, total_water);

    // 3a. Run allocation based on urgency only
    printf("\n--- Strategy 1: Urgency-based allocation ---\n");
    allocate_resources(zones, zone_count, total_food, total_water);

    // 3b. Run allocation using urgency + distance (you can comment this out if not needed)
    printf("\n--- Strategy 2: Urgency + distance-aware allocation ---\n");
    allocate_resources_with_distance(zones, zone_count, total_food, total_water, g, 0);

    // 4. Cleanup
    free_graph(g);
    free(zones);

    return 0;
}
