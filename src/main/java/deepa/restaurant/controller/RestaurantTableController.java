package deepa.restaurant.controller;

import deepa.restaurant.entity.RestaurantTable;
import deepa.restaurant.service.RestaurantTableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/tables")
public class RestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    public RestaurantTableController(
            RestaurantTableService restaurantTableService) {
        this.restaurantTableService = restaurantTableService;
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> createTable(
            @Valid @RequestBody RestaurantTable restaurantTable) {

        return ResponseEntity.ok(
                restaurantTableService.createTable(restaurantTable)
        );
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {

        return ResponseEntity.ok(
                restaurantTableService.getAllTables()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                restaurantTableService.getTableById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantTable restaurantTable) {

        return ResponseEntity.ok(
                restaurantTableService.updateTable(
                        id,
                        restaurantTable
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(
            @PathVariable Long id) {

        restaurantTableService.deleteTable(id);

        return ResponseEntity.noContent().build();
    }
}