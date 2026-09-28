package deepa.restaurant.service;

import deepa.restaurant.entity.Order;
import deepa.restaurant.entity.RestaurantTable;
import deepa.restaurant.repository.OrderRepository;
import deepa.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;

    public OrderService(
            OrderRepository orderRepository,
            RestaurantTableRepository restaurantTableRepository) {

        this.orderRepository = orderRepository;
        this.restaurantTableRepository = restaurantTableRepository;
    }

    // CREATE ORDER
    public Order createOrder(Long tableId) {

        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant table not found"));

        // Table must be FREE before starting a new order
        if (!"FREE".equalsIgnoreCase(table.getStatus())) {
            throw new RuntimeException(
                    "Table is not available. Current status: "
                            + table.getStatus()
            );
        }

        Order order = new Order();

        order.setOrderDate(LocalDateTime.now());
        order.setStatus("OPEN");
        order.setTotalAmount(0.0);
        order.setRestaurantTable(table);

        // Table is now occupied
        table.setStatus("OCCUPIED");
        restaurantTableRepository.save(table);

        return orderRepository.save(order);
    }

    // GET ALL ORDERS
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // GET ORDER BY ID
    public Order getOrderById(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
    }

    // UPDATE ORDER
    public Order updateOrder(
            Long id,
            Order updatedOrder) {

        Order existingOrder = getOrderById(id);

        if (updatedOrder.getStatus() != null &&
                !updatedOrder.getStatus().isBlank()) {

            existingOrder.setStatus(updatedOrder.getStatus());
        }

        if (updatedOrder.getTotalAmount() != null) {
            existingOrder.setTotalAmount(
                    updatedOrder.getTotalAmount());
        }

        return orderRepository.save(existingOrder);
    }

    // DELETE ORDER
    public void deleteOrder(Long id) {

        Order order = getOrderById(id);

        RestaurantTable table = order.getRestaurantTable();

        orderRepository.delete(order);

        // Free the table after deleting the order
        table.setStatus("FREE");
        restaurantTableRepository.save(table);
    }
}