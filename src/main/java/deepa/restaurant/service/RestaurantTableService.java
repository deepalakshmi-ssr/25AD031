package deepa.restaurant.service;

import deepa.restaurant.entity.RestaurantTable;
import deepa.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    // CREATE
    public RestaurantTable createTable(RestaurantTable restaurantTable) {

        if (restaurantTable.getStatus() == null ||
                restaurantTable.getStatus().isBlank()) {

            restaurantTable.setStatus("FREE");
        }

        return restaurantTableRepository.save(restaurantTable);
    }

    // READ ALL
    public List<RestaurantTable> getAllTables() {
        return restaurantTableRepository.findAll();
    }

    // READ BY ID
    public RestaurantTable getTableById(Long id) {

        return restaurantTableRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant table not found"));
    }

    // UPDATE
    public RestaurantTable updateTable(
            Long id,
            RestaurantTable updatedTable) {

        RestaurantTable existingTable = getTableById(id);

        existingTable.setTableNumber(updatedTable.getTableNumber());
        existingTable.setCapacity(updatedTable.getCapacity());

        if (updatedTable.getStatus() != null &&
                !updatedTable.getStatus().isBlank()) {

            existingTable.setStatus(updatedTable.getStatus());
        }

        return restaurantTableRepository.save(existingTable);
    }

    // DELETE
    public void deleteTable(Long id) {

        RestaurantTable existingTable = getTableById(id);

        restaurantTableRepository.delete(existingTable);
    }
}