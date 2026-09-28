package deepa.restaurant.repository;

import deepa.restaurant.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantTableRepository
        extends JpaRepository<RestaurantTable, Long> {

}